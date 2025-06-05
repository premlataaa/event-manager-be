import asyncHandler from "express-async-handler";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";


// Create a new event
export const createEvent = asyncHandler(async (req, res) => {
    const {user_id} = req.authData;
    const { title, description, location, image } = req.body;

    if (!title || !description || !location || !image) {
        res.status(400).json({id:0, message: "Please add all fields" });
    }
    const event = await Event.create({
        creator: user_id,
        title,
        description,
        location,
        image,
    });
    res.status(201).json({id:1,event});
});

// Get all events with attendees with pagination and filtering if provided
export const getAllEvents = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    search = "",
    sortField = "date",    // default sort by date
    sortOrder = "asc",     // asc or desc
    creator,               // optional filter by creator
    fromDate,
    toDate
  } = req.query;
  
  const { user_id } = req.authData;
  page = parseInt(page);
  limit = parseInt(limit);

  // Build filter conditions
  const filter = {};

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  if (creator) {
    filter.creator = creator;
  }

  if (fromDate || toDate) {
    filter.date = {};
    if (fromDate) filter.date.$gte = new Date(fromDate);
    if (toDate) filter.date.$lte = new Date(toDate);
  }

  // Sort object
  const sortOptions = {
    [sortField]: sortOrder === "desc" ? -1 : 1
  };

  // Fetch events with creator populated
  const events = await Event.find(filter)
    .populate("creator", "name email") // populate creator info
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  // For each event, get the registered attendees and check if user is registered
  const eventsWithAttendees = await Promise.all(
    events.map(async (event) => {
      const registrations = await Registration.find({ event: event._id })
        .populate("attendee", "name email"); // populate attendee info
      
      // Check if current user is registered for this event
      const userRegistration = await Registration.findOne({
        event: event._id,
        attendee: user_id
      });
      
      return {
        ...event.toObject(),
        attendees: registrations.map(reg => reg.attendee),
        hasRegistered: !!userRegistration // true if registered, false if not
      };
    })
  );

  const totalEvents = await Event.countDocuments(filter);
  const totalPages = Math.ceil(totalEvents / limit);
  const hasMore = page < totalPages;

  res.status(200).json({ 
    events: eventsWithAttendees, 
    totalEvents, 
    totalPages, 
    hasMore 
  });
});
  
// Get a single event with creator and attendees
export const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.authData;
  // Get the event with creator populated
  const event = await Event.findById(id)
    .populate("creator", "name email");
  
  if (!event) {
      res.status(404);
      throw new Error("Event not found");
  }

  // Get all registrations for this event with attendee info
  const registrations = await Registration.find({ event: id })
    .populate("attendee", "name email");
  
  // Combine the data
  const eventWithAttendees = {
    ...event.toObject(),
    attendees: registrations.map(reg => reg.attendee),
    hasRegistered: registrations.some(reg => reg.attendee._id.toString() === user_id)
  };

  res.status(200).json(eventWithAttendees);
});

// Update an event
export const updateEvent = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const { title, description, location, image } = req.body;
    const event = await Event.findByIdAndUpdate(id, {
        title,
        description,
        location,
        image,
    });
    if (!event) {
        res.status(404);
        throw new Error("Event not found");
    }
    res.status(200).json(event);
});

// Delete an event
export const deleteEvent = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
        res.status(404);
        throw new Error("Event not found");
    }
    res.status(200).json(event);
});

// Register/Unregister for an event by Toggling
export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.authData;
  
  // Check if event exists
  const event = await Event.findById(id);
  if (!event) {
      res.status(404);
      throw new Error("Event not found");
  }

  // Check if user is already registered
  const registration = await Registration.findOne({
      event: id,
      attendee: user_id
  });

  if (registration) {
      // Unregister if already registered
      await registration.deleteOne();
      return res.status(200).json({ 
          success: true,
          action: "unregistered",
          message: "Successfully unregistered from event"
      });
  } else {
      // Register if not already registered
      const newRegistration = await Registration.create({
          event: id,
          attendee: user_id,
      });
      return res.status(201).json({ 
          success: true,
          action: "registered",
          message: "Successfully registered for event",
          registration: newRegistration
      });
  }
});
