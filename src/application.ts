import Express, { RequestHandler, NextFunction } from 'express'
import { NextHandleFunction, ErrorHandleFunction } from 'connect'

/**
 * Type to register one Resource in the BuilderBox Aplication.
 */
export type ResourceType = [string, Express.Router]

/**
 * Type register one Middleware in the Builder Box Application.
 */
export type MiddlewareType =
    | RequestHandler
    | NextFunction
    | NextHandleFunction
    | ErrorHandleFunction

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
     */
    registerResource(resource: ResourceType): ApplicationInterface

    /**
     * Register one middleware in the application.
     *
     * @param {MiddlewareType} middleware
     * @returns {ApplicationInterface} Middleware thaht you want to register. See {@link https://expressjs.com/es/guide/using-middleware.html#middleware.application|Express Middlerare }
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
        if (!this.isBooted) this.resources.push(resource)
        return this
    }

    /**
     * {@inheritdoc}
     */
    public registerMiddleware(
        middleware: MiddlewareType
    ): ApplicationInterface {
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
