import busboy from 'busboy';
import express from 'express';
import fs from 'fs';
import MediaInfoFactory, { ReadChunkFunc, ResultMap } from 'mediainfo.js';
import path from 'path';
import InternalError from './InternalError';
import CODE from './code';
import { extractFileExtension } from './util/util';
import config from '../configs/config';

export interface CommonSearchAttr {
    orderBy?: string;
    limit?: number;
    offset?: number;
};

//미디어 파일의 추출정보
export interface MediaInfo {
    uuid?: string;
    mime?: string;
    format?: string;
};

export interface FileInfo {
    name: string; //unixtime으로 새로 만든 파일명
    path: string; //업로드 경로
    origin: string; //오리진 파일명
    size: number;
    type?: string;
    mime?: string;
    format?: string;
    info?: any;
};

// 미디어 정보 추출
export const mediaInfo = (path: string, size: number): Promise<{ result: ResultMap['object'] }> => {

    return new Promise((resolve, reject) => {

        try {

            MediaInfoFactory()
                .then(async (mediainfo) => {

                    const fd = fs.openSync(path, 'r');
                    const readChunk: ReadChunkFunc = (size, offset) => {
                        const buffer = new Uint8Array(size);
                        const bytes = fs.readSync(fd, buffer, 0, size, offset);
                        console.log(`Common.mediaInfo read bytes [%d]`, bytes);
                        return buffer;
                    };

                    return mediainfo.analyzeData(() => size, readChunk)
                        .then((result: ResultMap['object']) => {
                            return { result, mediainfo };
                        });
                })
                .then(({ result, mediainfo }) => {

                    mediainfo.close();
                    console.log('result >> ', JSON.stringify(result));

                    resolve({ result });
                });
        } catch (error) {
            console.error('Common.mediainfo', error);
        };
    });
};

export const multipart = (req: express.Request): Promise<{ fields: { [key: string]: any }, files: FileInfo[] }> => {

    return new Promise<{ fields: { [key: string]: any }, files: FileInfo[] }>((resolve, reject) => {

        let fields: { [key: string]: any } = {};
        let files: FileInfo[] = [];

        // 파일 업로드 여부
        let fileUpload = false;

        const bb = busboy({ headers: req.headers });

        bb.on('file', async (name, file, info) => {

            // 파일 업로드시
            fileUpload = true;

            let { filename, encoding, mimeType } = info;

            //한글 깨짐
            filename = Buffer.from(filename, 'latin1').toString('utf-8');
            console.log(`File [${name}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);

            //확장자 추출
            const ext = extractFileExtension(filename);

            const currentDate = new Date(); // 현재 날짜 및 시간
            const year = String(currentDate.getFullYear()).slice(-2); // 현재 연도의 뒤 두자리 추출
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 현재 월, 한 자리면 두자리로 변경
            const day = String(currentDate.getDate()).padStart(2, '0'); // 현재 일, 한 자리면 두자리로 변경
            const dateFolder = `${year}${month}${day}`; // 폴더명 지정 (ex 240101)
            const folderPath = path.join(config.storage.path, dateFolder);

            // 폴더가 없으면 생성
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            };

            const newname = `${Date.now()}.${ext}`;
            const saveTo = path.join(folderPath, newname).replace(/\\/g, '/');

            let fileSize = 0;

            file.on('data', (data) => {

                fileSize += data.length;

            }).on('close', async () => {
                console.log(`File [${name}] done`);
                console.log(`File [${fileSize}] fileSize`);

                files.push({
                    name: newname,
                    path: saveTo,
                    origin: filename,
                    size: fileSize,
                    mime: mimeType,
                    type: mimeType.split('/')[0],
                    info: {
                        encoding: info.encoding
                    }
                });

            }).on('error', (error) => {
                reject(error);
            });

            file.pipe(fs.createWriteStream(saveTo));

        });

        bb.on('field', (name, val, info) => {
            console.log(`Field [${name}]: value: %j`, val);
            fields[`${name}`] = val;
        });

        bb.on('error', (error) => {
            console.trace(`Error : `, error);
            reject(error);
        });

        bb.on('close', () => {
            console.log('Done parsing form!');

            // 파일 업로드하지 않고 필드 값만 변경
            if (!fileUpload) {
                resolve({ fields, files: [] });
                return;
            };

            resolve({ fields, files });
        });

        req.pipe(bb);
    })
        .then(async ({ fields, files }) => {

            if (!!files && files.length > 0) {

                for (let f of files) {

                    const info = await mediaInfo(f.path, f.size);
                    console.log('Common.mediaInfo file format, ', f.format);
                    console.log('Common.mediaInfo file mime , ', f.mime);
                    const videoCount = info.result.media?.track.filter((track) => track['@type'] === 'Video').length;
                    const audioCount = info.result.media?.track.filter((track) => track['@type'] === 'Audio').length;
                    const imageCount = info.result.media?.track.filter((track) => track['@type'] === 'Image').length;


                    let mediaType = 'E';

                    if (videoCount) {
                        mediaType = 'V';
                        const duration: any = info.result.media?.track.find((track) => track['@type'] === 'Video')?.Duration;
                        const durationInMs = duration * 1000;
                        if (duration && (durationInMs > 300000)) {
                            throw new InternalError(CODE.BadRequest, '동영상 길이가 5분을 초과합니다.');
                        };
                    } else if (imageCount) {
                        mediaType = 'I';
                    } else if (audioCount) {
                        mediaType = 'A';
                    };

                    f.info = Object.assign(
                        f.info,
                        f.type = mediaType,
                        f.mime,
                        f.size,
                        f.format,
                        mediaInfo
                    );
                };
            };

            console.log('Common.multipart, ', fields);
            return { fields, files };
        });
};