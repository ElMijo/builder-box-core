jest.doMock('express', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
        const app = () => {}
        app.use = () => { app._router = () => {} }
        app._router = undefined
        return app;
    }),
    Router: jest.fn().mockImplementation(() => function router() {})
}))
import Express, { Router } from 'express'
import { Application, ResourceType, MiddlewareType } from '../../src/index'

describe("Testing Applicantion class...", () => {
    test("Checking that the Application class is instantiable", () => {
        expect(new Application).toBeInstanceOf(Object)
        expect(new Application(Express())).toBeInstanceOf(Object)
    })

    test("Test registerResource", () => {
        const app = new Application;
        const resource : ResourceType = ["/path", Router()]
        expect(app.registerResource(resource)).toBeInstanceOf(Application)
        expect(app.registerResource(["/path", Router()])).toBeInstanceOf(Application)
    })

    test("Test registerMiddleware", () => {
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
})
