import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLectureDto } from './dto/create.dto';
import { UpdateLectureDto } from './dto/update.dto';
import { GetLecturesByYearMonth } from './dto/query.dto';

@Injectable()
export class LecturesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateLectureDto | CreateLectureDto[]) {
        return Array.isArray(dto)
            ? await this.prisma.lecture.createMany({
                data: dto.map(({ ...rest }) => ({
                    ...rest,
                })),
                skipDuplicates: true,
            })
            : await this.prisma.lecture.create({
                data: dto
            })
    }

    async getDates() {
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

        return formattedResult;
    }

    async findAll(input: GetLecturesByYearMonth) {
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
            throw new Error(`Недопустимое название месяца: ${input.month}`);
        }

        // SQL-запрос для получения всех записей за указанный год и месяц
        const lectures = await this.prisma.$queryRaw`
            SELECT *
            FROM "Lecture"
            WHERE EXTRACT(YEAR FROM date) = ${Number(input.year)}
            AND TRIM(TO_CHAR(date, 'Month')) = ${englishMonth};
        `;

        return lectures;
    }

    async getByDate(date: string) {
        return await this.prisma.lecture.findMany({
            where: { date }
        })
    }

    async update(dto: UpdateLectureDto) {
        const { id, ...rest } = dto
        return await this.prisma.lecture.update({
            where: { id },
            data: { ...rest }
        })
    }

    async remove(id: string) {
        return await this.prisma.lecture.delete({
            where: { id }
        })
     }
}
