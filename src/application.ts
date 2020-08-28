import Express from 'express'

/**
 * Type to register one Resource in the BuilderBox Aplication.
 */
export type ResourceType = [string, Express.Router]

/**
 * Help to validate ResourceType implementation
 * @param {Boolean} obj
 */
export const isResourceType = (obj: any): obj is ResourceType => {
    return (
        Array.isArray(obj) &&
        obj.length === 2 &&
        typeof obj[0] === 'string' &&
        typeof obj[1] === 'function' &&
        obj[1].name === 'router'
    )
}

/**
 * Type register one Middleware in the Builder Box Application.
 */
export interface MiddlewareType extends Express.RequestHandler {}

/**
 * Help to validate ResourceType implementation
 * @param {any} obj
 */
export const isMiddlewareType = (obj: any): obj is MiddlewareType => {
    return typeof obj === 'function'
}

/**
 * Application Interface.
 */
export interface ApplicationInterface {
    /**
     * Register one resource in the application.
     *
     * @param {string} path Path where you want to register the resource. See {@link https://expressjs.com/es/guide/routing.html#route-paths|Express Router Path}
     * @param {Router} resource Router that you want to register. See {@link https://expressjs.com/es/guide/routing.html#express-router|Express Router}
     * @returns {ApplicationInterface}
     * @throws {Error} When given invalid parameter type.
     */
    registerResource(resource: ResourceType): ApplicationInterface

    /**
     * Register one middleware in the application.
     *
     * @param {MiddlewareType} middleware
     * @returns {ApplicationInterface} Middleware thaht you want to register. See {@link https://expressjs.com/es/guide/using-middleware.html#middleware.application|Express Middlerare }
     * @throws {Error} When given invalid parameter type.
     */
    registerMiddleware(middleware: MiddlewareType): ApplicationInterface

    /**
     * Get Express Application with all configuration.
     * @returns {Application}
     */
    getEngine(): Express.Application
}

export class Application implements ApplicationInterface {
    /**
     * @type {Express.Application}
     */
    private app: Express.Application

    /**
     * @type {Boolean}
     */
    private isBooted: boolean = false

    /**
     * @type {ResourceType[]}
     */
    private resources: ResourceType[] = []

    /**
     * @type {MiddlewareType[]}
     */
    private middlewares: MiddlewareType[] = []

    constructor(app?: Express.Application) {
        this.app = app || Express()
    }

    /**
     * {@inheritdoc}
     */
    public registerResource(resource: ResourceType): ApplicationInterface {
        if (!isResourceType(resource)) {
            throw new Error('The resource object is not a ResourceType')
        }
        if (!this.isBooted) this.resources.push(resource)
        return this
    }

    /**
     * {@inheritdoc}
     */
    public registerMiddleware(
        middleware: MiddlewareType
    ): ApplicationInterface {
        if (!isMiddlewareType(middleware)) {
            throw new Error('The middleware object is not a MiddlewareType')
        }
        if (!this.isBooted) this.middlewares.push(middleware)
        return this
    }

    /**
     * {@inheritdoc}
     */
    public getEngine(): Express.Application {
        if (!this.isBooted) this.boot()
        return this.app
    }

    private boot() {
        this.middlewares.forEach((middleware) => this.app.use(middleware))
        this.resources.forEach((resource) => this.app.use(...resource))
        this.isBooted = true
        return this
    }
}
