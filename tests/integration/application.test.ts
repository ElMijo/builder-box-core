import cors from 'cors'
import { json, urlencoded } from 'body-parser'
import Express, { Router, Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { Application, ResourceType, MiddlewareType } from '../../src/index'

describe("Testing Applicantion class...", () => {
    test("Checking that the Application class is instantiable", () => {
        expect(new Application).toBeInstanceOf(Object)
        expect(new Application(Express())).toBeInstanceOf(Object)
    })

    test("Test registerResource when given valid", () => {
        const app = new Application;
        const resource : ResourceType = ["/path", Router()]
        expect(app.registerResource(resource)).toBeInstanceOf(Application)
        expect(app.registerResource(["/path", Router()])).toBeInstanceOf(Application)
    })

    test("Test registerMiddleware when given valid", () => {
        const app = new Application;
        const middleware : MiddlewareType = () => {}
        expect(app.registerMiddleware(middleware)).toBeInstanceOf(Application)
        expect(app.registerMiddleware(() => {})).toBeInstanceOf(Application)
    })

    test("Test getEngine when not add any resource or middleware", () => {
        const app = new Application;
        const EXpressApp = app.getEngine()
        expect(EXpressApp.name).toBe("app")
        expect(EXpressApp._router === undefined).toBeTruthy()
        expect(app.getEngine()).toEqual(EXpressApp)
    })

    test("Test getEngine when add any resource or middleware before booted", () => {
        const resource : ResourceType = ["/path", Router()]
        const middleware : MiddlewareType = () => {}
        const EXpressApp = (new Application)
            .registerMiddleware(middleware)
            .registerResource(resource)
            .getEngine()
        expect(EXpressApp.name).toBe("app")
        expect(EXpressApp._router).toBeInstanceOf(Function)
    })

    test("Test getEngine when add any resource or middleware after booted", () => {
        const resource : ResourceType = ["/path", Router()]
        const middleware : MiddlewareType = () => {}
        const app = new Application
        const EXpressApp = app.getEngine()
        app.registerMiddleware(middleware).registerResource(resource)
        expect(app.getEngine()).toEqual(EXpressApp)
    })

    test("Test app booted runing", (done) => {
        const resource : ResourceType = ["/path", Router()]
        const middleware : MiddlewareType = () => {}
        const app = new Application
        const EXpressApp = app.getEngine()
        app.registerMiddleware(middleware).registerResource(resource)
        request(app.getEngine())
            .get("/")
            .expect(404, done)

    })

    test("Test app booted runing full features", (done) => {
        const router : Router = Router()
        router.use('/', (req: Request, res: Response) => res.json({message: "Testing api..."}))
        const resource : ResourceType = ["/api", router]
        const middleware : MiddlewareType = (req: Request, res: Response, next: NextFunction) => {
            res.set('X-VALUE', 'Builder Box Test');
            next()
        }
        const app = new Application
        app
            .registerMiddleware(cors())
            .registerMiddleware(json())
            .registerMiddleware(urlencoded({ extended: true }))
            .registerMiddleware(middleware)
            .registerResource(resource)
        request(app.getEngine())
            .get("/api")
            .expect('X-VALUE', 'Builder Box Test')
            .expect('content-type', 'application/json; charset=utf-8')
            .expect('Access-Control-Allow-Origin', '*')
            .expect(200, {message: "Testing api..."}, done)
    })
})
