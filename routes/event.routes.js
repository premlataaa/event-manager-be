import express from "express";
import {
    createEvent, getAllEvents,
    getEvent, updateEvent, deleteEvent,
    registerForEvent
} from "../controllers/event.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const eventRouter = express.Router();
eventRouter.use(verifyToken);
eventRouter.post("/create", createEvent);
eventRouter.get("/", getAllEvents);
eventRouter.get("/:id", getEvent);
eventRouter.put("/:id", updateEvent);
eventRouter.delete("/:id", deleteEvent);
eventRouter.post("/:id/register", registerForEvent);

export default eventRouter;