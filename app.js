const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DataBase error is ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

// API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQueryResult = "";
  const { search_q = "", priority, status, category } = request.query;

  /*console.log(hasPriorityAndStatusProperties(request.query));
  console.log(hasPriorityProperty(request.query));
  console.log(hasStatusProperty(request.query));
  console.log(hasSearchProperty(request.query));
  console.log(hasCategoryProperty(request.query));
  console.log(hasCategoryAndStatusProperty(request.query));
  console.log(hasCategoryAndPriorityProperty(request.query));*/

  switch (true) {
    // scenario 1
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQueryResult = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}';`;
        data = await db.all(getTodoQueryResult);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //scenario 2

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQueryResult = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    priority = '${priority}';`;
        data = await db.all(getTodoQueryResult);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //scenario 3
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQueryResult = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}' AND priority = '${priority}';`;
          data = await db.all(getTodoQueryResult);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //scenario 4
    case hasSearchProperty(request.query):
      getTodoQueryResult = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%';`;
      data = await db.all(getTodoQueryResult);
      response.send(data.map((eachItem) => outPutResult(eachItem)));
      break;

    //scenario 5
    case hasCategoryAndStatusProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQueryResult = `
                    SELECT 
                        *
                    FROM
                        todo
                    WHERE
                        category = '${category}' AND status = '${status}';`;
          data = await db.all(getTodoQueryResult);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //scenario 6
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQueryResult = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    category = '${category}';`;
        data = await db.all(getTodoQueryResult);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //scenario 7
    case hasCategoryAndPriorityProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQueryResult = `
                    SELECT 
                        *
                    FROM
                        todo
                    WHERE
                        category = '${category}' AND priority = '${priority}';`;
          data = await db.all(getTodoQueryResult);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodoQueryResult = `
            SELECT
                *
            FROM
                todo;`;
      data = await db.all(getTodoQueryResult);
      response.send(data.map((eachItem) => outPutResult(eachItem)));
  }
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(outPutResult(todo));
});

// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const requestQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            due_date = '${newDate}';`;
    const responseResult = await db.all(requestQuery);
    response.send(responseResult.map((eachItem) => outPutResult(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
// API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `
                    INSERT INTO 
                        todo (id, todo, priority, status, category, due_date)
                    VALUES 
                        (${id}, '${todo}', '${priority}', '${status}', '${category}', '${postNewDueDate}' );`;
          await db.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn = "";
  const requestBody = request.body;
  const previousTodoQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updatedTodoQuery;
  switch (true) {
    //scenario 1
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updatedTodoQuery = `
                    UPDATE todo
                    SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updatedTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //Scenario 2
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updatedTodoQuery = `
                    UPDATE todo
                    SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updatedTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //Scenario 3
    case requestBody.todo !== undefined:
      updatedTodoQuery = `
                    UPDATE todo
                    SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
      await db.run(updatedTodoQuery);
      response.send("Todo Updated");

      break;
    //Scenario 4
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updatedTodoQuery = `
                    UPDATE todo
                    SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updatedTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //Scenario 5
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updatedTodoQuery = `
                    UPDATE todo
                    SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updatedTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

// API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
