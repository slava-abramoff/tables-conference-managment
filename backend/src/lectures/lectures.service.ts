import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLectureDto } from './dto/create.dto';
import { UpdateLectureDto } from './dto/update.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';
import { AppLogger } from 'src/app.logger';
import { Lecture } from '@prisma/client';
import { group } from 'console';

@Injectable()
export class LecturesService {

    private convertMonth(month: string, toNumber: boolean): number | string | null {
        interface MonthInfo {
            number: number;
            en: string;
            ru: string;
        }

        const monthMap: Record<string, MonthInfo> = {
            january: { number: 1, en: 'January', ru: 'январь' },
            february: { number: 2, en: 'February', ru: 'февраль' },
            march: { number: 3, en: 'March', ru: 'март' },
            april: { number: 4, en: 'April', ru: 'апрель' },
            may: { number: 5, en: 'May', ru: 'май' },
            june: { number: 6, en: 'June', ru: 'июнь' },
            july: { number: 7, en: 'July', ru: 'июль' },
            august: { number: 8, en: 'August', ru: 'август' },
            september: { number: 9, en: 'September', ru: 'сентябрь' },
            october: { number: 10, en: 'October', ru: 'октябрь' },
            november: { number: 11, en: 'November', ru: 'ноябрь' },
            december: { number: 12, en: 'December', ru: 'декабрь' },
        };

        const key = month.trim().toLowerCase();

        if (toNumber) {
            // Русский → номер месяца
            const found = Object.values(monthMap).find(m => m.ru === key);
            return found ? found.number : null;
        } else {
            // Английский → русский
            return monthMap[key]?.ru ?? null;
        }
    }

    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger
    ) { }

    async create(dto: CreateLectureDto | CreateLectureDto[]) {
        try {
            const isArray = Array.isArray(dto);
            const result = isArray
                ? await this.prisma.lecture.createMany({
                    data: dto.map(({ ...rest }) => ({ ...rest })),
                    skipDuplicates: true,
                })
                : await this.prisma.lecture.create({ data: dto });

            this.logger.log(`Successfully created lecture(s)`,
                LecturesService.name,
                'create'
            );
            return result;
        } catch (error) {
            this.logger.error(
                `Failed to create lecture(s): ${error.message}`,
                error.stack,
                LecturesService.name,
                'create'
            );
            throw error;
        }
    }

    async getDates() {
        try {
            const result: any = await this.prisma.$queryRaw`
                SELECT
                EXTRACT(YEAR FROM date) AS year,
                array_agg(DISTINCT TO_CHAR(date, 'Month')) AS months
                FROM "Lecture"
                GROUP BY EXTRACT(YEAR FROM date)
                ORDER BY year;
            `;

            const formattedResult = {
                data: {
                    years: result.map(row => ({
                        year: Number(row.year),
                        months: row.months
                            .map((month: string) => this.convertMonth(month, false))
                            .sort((a, b) => {
                                const monthOrder = [
                                    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
                                    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
                                ];
                                return monthOrder.indexOf(a as string) - monthOrder.indexOf(b as string);
                            })
                    })),
                },
            };
            this.logger.log('Get available years and months', LecturesService.name, 'getDates')

            return formattedResult;
        } catch (error) {
            this.logger.error(
                `Failed to get available years and months, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'findAll'
            )
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async findAll(input: GetLecturesByYearMonth) {
        try {
            const monthNumber = this.convertMonth(input.month, true) as number;
            if (!monthNumber) {
                this.logger.error(`Month ${input.month} is not valid`, LecturesService.name, 'findAll')
                throw new HttpException(`Month ${input.month} is not valid`, HttpStatus.BAD_REQUEST);
            }

            const startDate = new Date(Number(input.year), monthNumber - 1, 1);
            const endDate = new Date(Number(input.year), monthNumber, 1);

            const lectures = await this.prisma.lecture.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            this.logger.log(`Get lectures by ${input.year} ${input.month}`, LecturesService.name, 'findAll');

            const formattedDays = Object.values(
                lectures.reduce((acc, { date, lector, group }) => {
                    const dateKey = date.toISOString().split('T')[0];

                    if (!acc[dateKey]) {
                        acc[dateKey] = { date: dateKey, lectors: [], groups: [] };
                    }

                    if (lector) {
                        acc[dateKey].lectors.push(lector);
                    }

                    if (group) {
                        acc[dateKey].groups.push(group);
                    }

                    return acc;
                }, {} as Record<string, { date: string; lectors: string[]; groups: string[] }>)
            );

            return formattedDays

        } catch (error) {
            this.logger.error(
                `Failed to get lectures by ${input.year} ${input.month}, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'findAll'
            );
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getByDate(date: string) {
        try {
            const result = await this.prisma.$queryRaw`
                SELECT * FROM "Lecture"
                WHERE DATE("date") = ${date}::date
            `;
            this.logger.log(`Get lectures by ${date}`, LecturesService.name, 'getByDate')
            return result
        } catch (error) {
            this.logger.error(
                `Failed to get lectures by ${date}, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'getByDate'
            )
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async update(dto: UpdateLectureDto) {
        try {
            const { id, ...rest } = dto
            const result = await this.prisma.lecture.update({
                where: { id },
                data: { ...rest }
            })
            this.logger.log(`Updated lecture with ID: ${id}`, LecturesService.name, 'update')
            return result
        } catch (error) {
            this.logger.error(
                `Failed to update lecture with ID: ${dto.id}, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'update'
            )
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async remove(id: string) {
        try {
            const result = await this.prisma.lecture.delete({
                where: { id }
            })
            this.logger.log(`Deleted lecture with ID: ${id} `, LecturesService.name, 'remove')
            return result
        } catch (error) {
            this.logger.error(
                `Failed to delete lecture with ID: ${id}, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'remove'
            )
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }
}
