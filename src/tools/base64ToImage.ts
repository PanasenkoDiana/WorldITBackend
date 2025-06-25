import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Image } from "../UserPostApp/userPost.type";

export async function base64ToImage(base64: string): Promise<{ filename: string; file: string }> {
    // Из data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAEWAgMAAAAGL
    // Возвращает image/png и iVBORw0KGgoAAAANSUhEUgAAAXIAAAEWAgMAAAAGL
	const info = base64.split(";base64,")

	// Хранит тип файла
	const extension = info[0].split("/")[1];
	// Хранит информацию о файле (base64)
	const imageData = info[1];

	const buffer = Buffer.from(imageData, "base64");
	const fileName = `${uuidv4()}.${extension}`;

	const mediaDir = path.join(__dirname, "..", "..", "media");
    // Проверяем наличие папки media, если нет — создаём
    if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
    }

    const filePath = path.join(mediaDir, fileName)

	await fs.promises.writeFile(filePath, buffer);
	if (!fs.existsSync(filePath)) {
		console.log("Ошибка создания изображения");
	}

	return {
		filename: fileName,
		file: fileName,
	};
}
