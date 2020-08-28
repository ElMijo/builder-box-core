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
import { Application, ResourceType, isResourceType, MiddlewareType, isMiddlewareType } from '../../src/index'

describe("Testing isResourceType function...", () => {
    test("Given invalid parameters", () => {
        expect(isResourceType(null)).toBeFalsy()
        expect(isResourceType(123)).toBeFalsy()
        expect(isResourceType("any")).toBeFalsy()
        expect(isResourceType({})).toBeFalsy()
        expect(isResourceType([])).toBeFalsy()
        expect(isResourceType(() => {})).toBeFalsy()
        expect(isResourceType(undefined)).toBeFalsy()
        expect(isResourceType([123, "any"])).toBeFalsy()
        expect(isResourceType([123, () => {}])).toBeFalsy()
        expect(isResourceType(["any", () => {}])).toBeFalsy()
    })
    test("Given valid parameters", () => {
        const resource : ResourceType = ["/path", Router()]
        expect(isResourceType(resource)).toBeTruthy()
    })
})

describe("Testing isMiddlewareType function...", () => {
    test("Given invalid parameters", () => {
        expect(isMiddlewareType(null)).toBeFalsy()
        expect(isMiddlewareType(123)).toBeFalsy()
        expect(isMiddlewareType("any")).toBeFalsy()
        expect(isMiddlewareType({})).toBeFalsy()
        expect(isMiddlewareType([])).toBeFalsy()
    })
    test("Given valid parameters", () => {
        const middleware : MiddlewareType = () => {}
        expect(isMiddlewareType(middleware)).toBeTruthy()
    })
})

describe("Testing Applicantion class...", () => {
    test("Checking that the Application class is instantiable", () => {
        expect(new Application).toBeInstanceOf(Object)
        expect(new Application(Express())).toBeInstanceOf(Object)
    })
    
    test("Test registerResource when given invalid parameters", () => {
        const app = new Application
        expect(() => app.registerResource(null)).toThrow("The resource object is not a ResourceType")
    })
    
    test("Test registerResource when given valid", () => {
        const app = new Application;
        const resource : ResourceType = ["/path", Router()]
        expect(app.registerResource(resource)).toBeInstanceOf(Application)
        expect(app.registerResource(["/path", Router()])).toBeInstanceOf(Application)
    })
    
    test("Test registerMiddleware when given invalid parameters", () => {
        const app = new Application;
        expect(() => app.registerMiddleware(null)).toThrow("The middleware object is not a MiddlewareType")
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
})