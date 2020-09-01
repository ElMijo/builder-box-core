import { Server, Application, ResourceType, MiddlewareType } from '../../src/index'
import { Router, Request, Response, NextFunction } from 'express'
import { get } from "http";

describe("Testing Server class...", () => {
    test("Test isRunning method when init Serve", () => {
        expect((new Server(new Application)).isRuning()).toBeFalsy()
    })

    test("Test server runing without resource defined", async (done) => {
        const server = new Server(new Application)
        await server.start()
        get('http://localhost:5000', async (res) => {
            await server.stop()
            expect(res.statusCode).toBe(404)
            done()
        })
    })

    test("Test server runing with resource defined", async (done) => {
        const router : Router = Router()
        router.use('/', (req: Request, res: Response) => res.json({message: "Testing api..."}))
        const resource : ResourceType = ["/api", router]
        const middleware : MiddlewareType = (req: Request, res: Response, next: NextFunction) => {
            res.set('X-VALUE', 'Builder Box Test');
            next()
        }
        const app = new Application
        app.registerMiddleware(middleware).registerResource(resource)
        const server = new Server(app)
        await server.start()
        expect(server.isRuning()).toBeTruthy()
        get('http://localhost:5000/api', async (res) => {
            await server.stop()
            expect(res.headers['x-value']).toBe('Builder Box Test')
            expect(res.statusCode).toBe(200)
            res.on('data', body => {
                expect(JSON.parse(body)).toMatchObject({message: "Testing api..."})
                done()
            })
        })
    })
})
