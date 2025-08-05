import { Injectable } from '@nestjs/common';
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
        this.logger.debug('start', LecturesService.name, 'create')
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
        this.logger.debug('start', LecturesService.name, 'getDates')
        // SQL-запрос для группировки по году и месяцу
        const result: any = await this.prisma.$queryRaw`
            SELECT
            EXTRACT(YEAR FROM date) AS year,
            array_agg(DISTINCT TO_CHAR(date, 'Month')) AS months
            FROM "Lecture"
            GROUP BY EXTRACT(YEAR FROM date)
            ORDER BY year;
        `;
        this.logger.debug('get query results', LecturesService.name, 'getDates')

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
        this.logger.debug('formatted results', LecturesService.name, 'getDates')

        return formattedResult;
    }

    async findAll(input: GetLecturesByYearMonth) {
        this.logger.debug('start', LecturesService.name, 'findAll')
        this.logger.debug(`year: ${input.year}, month: ${input.month}`, LecturesService.name, 'findAll')

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
            this.logger.error('month is not valid', LecturesService.name, 'findAll')
            throw new Error(`Недопустимое название месяца: ${input.month}`);
        }
        this.logger.debug('month is ok', LecturesService.name, 'findAll')

        // SQL-запрос для получения всех записей за указанный год и месяц
        const lectures = await this.prisma.$queryRaw`
            SELECT *
            FROM "Lecture"
            WHERE EXTRACT(YEAR FROM date) = ${Number(input.year)}
            AND TRIM(TO_CHAR(date, 'Month')) = ${englishMonth};
        `;
        this.logger.debug('getting data', LecturesService.name, 'findAll')

        return lectures;
    }

    async getByDate(date: string) {
        this.logger.debug('start', LecturesService.name, 'getByDate');
        this.logger.debug(`date: ${date}`, LecturesService.name, 'getByDate');
        return await this.prisma.$queryRaw`
            SELECT * FROM "Lecture"
            WHERE DATE("date") = ${date}::date
        `;
    }

    async update(dto: UpdateLectureDto) {
        this.logger.debug('start', LecturesService.name, 'update')
        const { id, ...rest } = dto
        return await this.prisma.lecture.update({
            where: { id },
            data: { ...rest }
        })
    }

    async remove(id: string) {
        this.logger.debug('start', LecturesService.name, 'remove')
        return await this.prisma.lecture.delete({
            where: { id }
        })
    }
}
