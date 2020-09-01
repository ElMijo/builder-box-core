import Http from 'http'
import { ApplicationInterface } from './application'

/**
 * Help to validate PortType implementation
 * @param {any} num
 */
export const isPortType = (num: any): num is number =>
    Number.isInteger(num) && num > 0

/**
 * Help to validate HostnameType implementation
 * @param {any} str
 */
export const isHostnameType = (str: any): str is string =>
    typeof str === 'string' && !!str.trim()

/**
 * Help to validate HandlerErrorType implementation
 * @param {any} fun
 */
export const isHandlerErrorType = (fun: any): fun is Function =>
    typeof fun === 'function'

export interface ServerConfig {
    port?: number
    hostname?: string
    handlerErrors?: Function
}

const defaultConfig: ServerConfig = {
    port: 5000,
    hostname: 'localhost',
    handlerErrors: () => {},
}

/**
 * Server interface.
 */
export interface ServerInterface {
    /**
     * Start server in the port and hostname defined
     * @returns {Promise<any>}
     */
    start(): Promise<any>

    /**
     * Stop server and close connection.
     * @returns {Promise<any>}
     */
    stop(): Promise<any>

    /**
     * Return true when the server is runing
     * @returns {Boolean}
     */
    isRuning(): boolean
}

export class Server implements ServerInterface {
    /**
     * @type {Http.Server}
     */
    private http: Http.Server

    /**
     * @type {PornumtType}
     */
    private port: number

    /**
     * @type {string}
     */
    private hostname: string

    /**
     * @type {Function}
     */
    private handler: Function

    /**
     *
     * @param {ApplicationInterface} app
     * @param {Number} port
     * @param {String} hostname
     */
    constructor(app: ApplicationInterface, config: ServerConfig = {}) {
        const { port, hostname, handlerErrors } = {
            ...defaultConfig,
            ...config,
        }
        this.http = Http.createServer(app.getEngine())
        this.setPort(port).setHostname(hostname).setHandlerErrors(handlerErrors)
    }

    /**
     * {@inheritdoc}
     */
    public start(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.http.listening) return resolve()
            this.http.listen(this.port, this.hostname)
            this.http.on('listening', () => {
                console.log(
                    `🚀 Builder Box is ready http://${this.hostname}:${this.port}`
                )
                resolve()
            })
            this.http.on('error', (err) => {
                console.log(`🚀 Builder Box error: ${err.stack}`)
                this.handler(err)
                this.http.close()
                reject(err)
            })
        })
    }

    /**
     * {@inheritdoc}
     */
    public stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.close((err) => {
                console.log(
                    err
                        ? `🚀 Builder Box close error: ${err.stack}`
                        : `🚀 Builder Box is down...`
                )
                err ? reject(err) : resolve()
            })
        })
    }

    /**
     * {@inheritdoc}
     */
    public isRuning(): boolean {
        return this.http.listening
    }

    /**
     * Set port where the server has to run.
     *
     * @param {number} port The port number.
     * @returns {Server}
     */
    private setPort(port: number): Server {
        if (!isPortType(port)) throw new Error(`Invalid port number [${port}]`)
        this.port = port
        return this
    }

    /**
     * Set Host where the server has to run.
     *
     * @param {string} host The Host number.
     * @returns {Server}
     */
    private setHostname(hostname: string): Server {
        if (!isHostnameType(hostname))
            throw new Error(`Invalid hostname [${hostname}]`)
        this.hostname = hostname
        return this
    }

    /**
     * Set handler error function.
     * @param {Function} handler
     * @returns {Server}
     */
    private setHandlerErrors(handler: Function): Server {
        if (!isHandlerErrorType(handler))
            throw new Error(`Invalid handler errors [${handler}]`)
        this.handler = handler
        return this
    }
}
