import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

const todayDate = new Date().toLocaleString("pt-BR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "long",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  second: "2-digit",
});

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: todayDate,
        updated_at: todayDate,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },

  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const tasks = database.select("tasks");
      return res.end(JSON.stringify(tasks));
    },
  },

  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description, created_at } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title or description are required" })
          );
      }

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, {
        title,
        description,
        completed_at: null,
        created_at: task.created_at,
        updated_at: todayDate,
      });
      return res.writeHead(204).end();
    },
  },

  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update("tasks", id, {
        title: task.title,
        description: task.description,
        completed_at: completed_at,
        created_at: task.created_at,
        updated_at: task.updated_at,
      });

      return res.writeHead(204).end();
    },
  },
];
