jest.mock('../../src/application')
import { Server, isPortType, isHostnameType, isHandlerErrorType, Application } from '../../src/index'

describe("Testing isPortType helper", () => {
    test("Given invalid parameters", () => {
        expect(isPortType(null)).toBeFalsy()
        expect(isPortType("any")).toBeFalsy()
        expect(isPortType({})).toBeFalsy()
        expect(isPortType([])).toBeFalsy()
        expect(isPortType(() => {})).toBeFalsy()
        expect(isPortType(undefined)).toBeFalsy()
    })
    test("Given valid parameters", () => {
        expect(isPortType(1234)).toBeTruthy()
    })
})

describe("Testing isHostnameType helper", () => {
    test("Given invalid parameters", () => {
        expect(isHostnameType(null)).toBeFalsy()
        expect(isHostnameType(123)).toBeFalsy()
        expect(isHostnameType({})).toBeFalsy()
        expect(isHostnameType([])).toBeFalsy()
        expect(isHostnameType(() => {})).toBeFalsy()
        expect(isHostnameType(undefined)).toBeFalsy()
    })
    test("Given valid parameters", () => {
        expect(isHostnameType('localhost')).toBeTruthy()
        expect(isHostnameType('0.0.0.0')).toBeTruthy()
    })
})

describe("Testing isHandlerErrorType helper", () => {
    test("Given invalid parameters", () => {
        expect(isHandlerErrorType(null)).toBeFalsy()
        expect(isHandlerErrorType(123)).toBeFalsy()
        expect(isHandlerErrorType({})).toBeFalsy()
        expect(isHandlerErrorType([])).toBeFalsy()
        expect(isHandlerErrorType(undefined)).toBeFalsy()
    })
    test("Given valid parameters", () => {
        expect(isHandlerErrorType(() => {})).toBeTruthy()
        expect(isHandlerErrorType(function() {})).toBeTruthy()
    })
})

describe("Testing Server class...", () => {
    test("Checking that the Server class is instantiable", () => {
        expect(new Server(new Application)).toBeInstanceOf(Object)
    })
    test('Throw Error when given invalid port', () => {
        expect(() => new Server(new Application, { port: 0})).toThrow("Invalid port number [0]")
    })
    test('Throw Error when given invalid hostname', () => {
        expect(() => new Server(new Application, {hostname: ''})).toThrow("Invalid hostname []")
    })
    test('Throw Error when given invalid handlerError', () => {
        expect(() => new Server(new Application, {handlerErrors: null})).toThrow("Invalid handler errors [null]")
    })
    test("Test isRunning method when init Serve", () => {
        expect((new Server(new Application)).isRuning()).toBeFalsy()
    })
    test("Test start / stop method", async () => {
        const server = new Server(new Application)
        await server.start()
        expect(server.isRuning()).toBeTruthy()
        await server.start()
        expect(server.isRuning()).toBeTruthy()
        await server.stop()
        expect(server.isRuning()).toBeFalsy()
    })

    test("Test start / stop method when server cannot up", async () => {
        const serverA = new Server(new Application)
        await serverA.start()
        expect(serverA.isRuning()).toBeTruthy()
        const serverB = new Server(new Application, {
            handlerErrors: async (err) => {
                expect(err.code).toBe('EADDRINUSE')
                expect(serverB.isRuning()).toBeFalsy()
            }
        })
        await expect(async () => await serverB.start())
            .rejects
            .toThrow("listen EADDRINUSE: address already in use 127.0.0.1:5000")

        await serverA.stop()
        expect(serverA.isRuning()).toBeFalsy()
    })

    test("Test start / stop method when server cannot down", async () => {
        const server = new Server(new Application)
        await server.start()
        expect(server.isRuning()).toBeTruthy()
        await server.stop()
        expect(server.isRuning()).toBeFalsy()
        await expect(async () => await server.stop()).rejects.toThrow("Server is not running.")
    })
})
