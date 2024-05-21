import express, { Request, Response } from "express";
import databaseFunctions from "../Utils/databaseFunctions";
import * as sqlite3 from "sqlite3"; // Assuming you're using sqlite3
import sqlGenerator from "../Utils/sqlGenerator";

const router = express.Router();

function tableRoutes(db: sqlite3.Database) {
  router.get("/", async (req: Request, res: Response) => {
    try {
      const tables = await databaseFunctions.fetchAllTables(db);
      res.status(200).json(tables);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/local/query", async (req: Request, res: Response) => {
    try {
      await databaseFunctions.InitializeDB(db);
      const queries = await databaseFunctions.fetchQueries(db);
      res.status(200).json(queries);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/local/query", async (req: Request, res: Response) => {
    try {
      await databaseFunctions.InitializeDB(db);
      const { name, sqlStatement } = req.body;
      const response = await databaseFunctions.insertQuery(
        db,
        name,
        sqlStatement
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/:name", async (req: Request, res: Response) => {
    const { name } = req.params;
    try {
      const response = await databaseFunctions.fetchTable(db, name);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/infos/:name", async (req: Request, res: Response) => {
    const { name } = req.params;
    try {
      const response = await databaseFunctions.fetchTableInfo(db, name);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/insert", async (req: Request, res: Response) => {
    try {
      const { tablename, dataArray } = req.body;
      const sql = await sqlGenerator.generateInsertSQL(
        db,
        tablename,
        dataArray
      );
      const response = await databaseFunctions.insertTable(db, sql);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/generate/insert", async (req: Request, res: Response) => {
    try {
      const { tablename, dataArray } = req.body;
      const sql = await sqlGenerator.generateInsertSQL(
        db,
        tablename,
        dataArray
      );
      res.status(200).json(sql);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/query", async (req: Request, res: Response) => {
    try {
      const { sqlQuery } = req.body;
      const lowersqlQuery = sqlQuery.toLowerCase();
      if (lowersqlQuery.startsWith("select")) {
        const response = await databaseFunctions.runSelectQuery(
          db,
          lowersqlQuery
        );
        if (lowersqlQuery.startsWith("select count(*)")) {
          if (response.data !== undefined) {
            res.status(200).json({
              type: "string",
              data: "Count result is " + response.data[0]["count(*)"],
            });
          } else {
            res.status(500).json({
              type: "string",
              data: "Database error",
            });
          }
        } else {
          res.status(200).json({ type: "table", data: response.data });
        }
      } else {
        await databaseFunctions.runQuery(db, sqlQuery);
        let message = "";
        if (lowersqlQuery.startsWith("update"))
          message = "Updated Successfully";
        if (lowersqlQuery.startsWith("insert"))
          message = "Inserted Successfully";
        if (lowersqlQuery.startsWith("delete"))
          message = "Deleted Successfully";
        if (lowersqlQuery.startsWith("create"))
          message = "Created Successfully";
        res.status(200).json({ type: "string", data: message });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/create", async (req: Request, res: Response) => {
    try {
      const { tableName, data } = req.body;
      const sql = sqlGenerator.generateCreateTableSQL(tableName, data);
      const response = await databaseFunctions.insertTable(db, sql);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/generate/create", async (req: Request, res: Response) => {
    try {
      const { tableName, data } = req.body;
      const sql = sqlGenerator.generateCreateTableSQL(tableName, data);
      res.status(200).json(sql);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/update", async (req: Request, res: Response) => {
    try {
      const { tablename, dataArray, userId } = req.body;
      const sql = sqlGenerator.generateUpdateSQL(tablename, dataArray, userId);
      const response = await databaseFunctions.insertTable(db, sql);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/generate/update", async (req: Request, res: Response) => {
    try {
      const { tablename, dataArray, userId } = req.body;
      const sql = sqlGenerator.generateUpdateSQL(tablename, dataArray, userId);
      res.status(200).json(sql);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get(
    "/getrecord/:tablename/:id",
    async (req: Request, res: Response) => {
      try {
        const { tablename, id } = req.params;
        const response = await databaseFunctions.fetchRecord(
          db,
          tablename,
          Number(id)
        );
        res.status(200).json(response);
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  router.post("/delete", async (req: Request, res: Response) => {
    try {
      const { tablename, id } = req.body;
      const response = await databaseFunctions.deleteFromTable(
        db,
        tablename,
        id
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/table/delete", async (req: Request, res: Response) => {
    try {
      const { tablename } = req.body;
      const sql = `DROP TABLE ${tablename};`;
      const response = await databaseFunctions.insertTable(db, sql);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}

export default tableRoutes;
