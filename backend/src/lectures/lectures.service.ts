import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLectureDto } from './dto/create.dto';
import { UpdateLectureDto } from './dto/update.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';
import { AppLogger } from 'src/app.logger';

@Injectable()
export class LecturesService {
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
                `Failed to create lecture(s): ${error.message}`, // Сообщение об ошибке
                error.stack, // Стек вызовов
                LecturesService.name, // Контекст
                'create' // Метод
            );
            throw error;
        }
    }

    async getDates() {
        try {
            // SQL-запрос для группировки по году и месяцу
            const result: any = await this.prisma.$queryRaw`
                SELECT
                EXTRACT(YEAR FROM date) AS year,
                array_agg(DISTINCT TO_CHAR(date, 'Month')) AS months
                FROM "Lecture"
                GROUP BY EXTRACT(YEAR FROM date)
                ORDER BY year;
            `;

            // Маппинг английских названий месяцев на русские
            const monthMap = {
                'January': 'январь',
                'February': 'февраль',
                'March': 'март',
                'April': 'апрель',
                'May': 'май',
                'June': 'июнь',
                'July': 'июль',
                'August': 'август',
                'September': 'сентябрь',
                'October': 'октябрь',
                'November': 'ноябрь',
                'December': 'декабрь'
            };

            // Преобразуем результат в требуемый формат
            const formattedResult = {
                data: {
                    years: result.map(row => ({
                        year: Number(row.year),
                        months: row.months
                            .map(month => monthMap[month.trim()]) // Убираем пробелы и мапим на русские названия
                            .sort((a, b) => {
                                const monthOrder = [
                                    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
                                    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
                                ];
                                return monthOrder.indexOf(a) - monthOrder.indexOf(b);
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
            // Маппинг русских названий месяцев на английские для TO_CHAR
            const monthMap = {
                'январь': 'January',
                'февраль': 'February',
                'март': 'March',
                'апрель': 'April',
                'май': 'May',
                'июнь': 'June',
                'июль': 'July',
                'август': 'August',
                'сентябрь': 'September',
                'октябрь': 'October',
                'ноябрь': 'November',
                'декабрь': 'December'
            };

            // Проверяем, что месяц валидный
            const englishMonth = monthMap[input.month.toLowerCase()];
            if (!englishMonth) {
                this.logger.error(`Month ${input.month} is not valid`, LecturesService.name, 'findAll')
                throw new HttpException(`Month ${input.month} is not valid`, HttpStatus.BAD_REQUEST)
            }

            // SQL-запрос для получения всех записей за указанный год и месяц
            const lectures = await this.prisma.$queryRaw`
                SELECT *
                FROM "Lecture"
                WHERE EXTRACT(YEAR FROM date) = ${Number(input.year)}
                AND TRIM(TO_CHAR(date, 'Month')) = ${englishMonth};
            `;

            this.logger.log(`Get lectures by ${input.year} ${input.month}`, LecturesService.name, 'findAll')

            return lectures;
        } catch (error) {
            this.logger.error(
                `Failed to get lectures by ${input.year} ${input.month}, error: ${error.message}`,
                error.stack,
                LecturesService.name,
                'findAll'
            )
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR)
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
