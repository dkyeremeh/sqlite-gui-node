"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlGenerator_1 = __importDefault(require("../Utils/sqlGenerator"));
describe("generateUpdateSQL", () => {
    test("should generate correct SQL for updating a table", () => {
        const tableName = "users";
        const data = [
            { name: "name", field: "name", value: "John Doe", type: "TEXT" },
            { name: "name", field: "age", value: 30, type: "INTEGER" },
        ];
        const id = 1;
        const expectedSQL = "UPDATE users SET name = 'John Doe', age = 30 WHERE id = 1;";
        const resultSQL = sqlGenerator_1.default.generateUpdateSQL(tableName, data, id);
        expect(resultSQL).toBe(expectedSQL);
    });
});
describe("generateCreateTableSQL", () => {
    test("should generate correct SQL for creating a table", () => {
        const tableName = "users";
        const data = [
            {
                field: "name",
                name: "id",
                type: "INTEGER",
                pk: "PRIMARY KEY",
                default: null,
            },
            { field: "name", name: "name", type: "TEXT", pk: "", default: null },
            { field: "name", name: "age", type: "INTEGER", pk: "", default: 0 },
        ];
        const expectedSQL = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER DEFAULT 0);";
        const resultSQL = sqlGenerator_1.default.generateCreateTableSQL(tableName, data);
        expect(resultSQL).toBe(expectedSQL);
    });
    test("should throw an error for unknown column type", () => {
        const tableName = "users";
        const data = [
            { field: "name", name: "id", type: "UNKNOWN", pk: "", default: null },
        ];
        expect(() => {
            sqlGenerator_1.default.generateCreateTableSQL(tableName, data);
        }).toThrowError("Unknown type: UNKNOWN");
    });
});
