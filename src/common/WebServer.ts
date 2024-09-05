import express from 'express';
import http from 'http';

interface WebServerOption {
    port?: number;
};

export default class WebServer {

    private was: express.Express = express();
    private option: WebServerOption;

    constructor(option: WebServerOption, was: express.Express) {

        this.option = option;
        this.was = was;
    };

    public start(): void {

        const server = http.createServer(this.was);
        const THIS = this;
        server.listen(this.option.port || 8080, function () {
            console.log(`HTTP PORT : ${THIS.option.port || 8080}`);
        });
    };
};