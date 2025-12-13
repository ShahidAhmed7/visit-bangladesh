import mongoose from "mongoose";
import Event from "../../models/Event.js";

const populateFields = [
  { path: "createdBy", select: "name email role" },
  { path: "comments.user", select: "name email role" },
];

class EventsService {
  buildFilters({ status, eventType, division, district }) {
    const filters = {};
    if (status) filters.status = status;
    if (eventType) filters.eventType = eventType;
    if (division) filters["location.division"] = division;
    if (district) filters["location.district"] = district;
    return filters;
  }

  sortUpcoming(query = {}) {
    const sortByStartDate = { startDate: 1, createdAt: 1 };
    const filter = query.startDate ? { ...query } : query;
    return Event.find(filter).sort(sortByStartDate).populate(populateFields).lean();
  }

  async list(filters) {
    const docs = await Event.find(filters).sort({ startDate: 1, createdAt: 1 }).populate(populateFields).lean();
    return docs;
  }

  async create(data) {
    const doc = await Event.create(data);
    return doc.populate(populateFields);
  }

  async findById(id) {
    return Event.findById(id).populate(populateFields).lean();
  }

  async update(id, data) {
    const doc = await Event.findByIdAndUpdate(id, data, { new: true });
    return doc ? doc.populate(populateFields) : null;
  }

  async delete(id) {
    return Event.findByIdAndDelete(id);
  }

  async toggleArrayField(eventId, userId, field) {
    const ev = await Event.findById(eventId);
    if (!ev) return null;
    const userObjId = new mongoose.Types.ObjectId(userId);
    const arr = ev[field] || [];
    const exists = arr.some((i) => i.equals(userObjId));
    if (exists) {
      ev[field] = arr.filter((i) => !i.equals(userObjId));
    } else {
      ev[field] = [...arr, userObjId];
    }
    await ev.save();
    return ev.populate(populateFields);
  }

  async addComment(eventId, userId, text) {
    const ev = await Event.findById(eventId);
    if (!ev) return null;
    ev.comments.push({ user: userId, text });
    await ev.save();
    return ev.populate(populateFields);
  }

  async deleteComment(eventId, commentId) {
    const ev = await Event.findById(eventId);
    if (!ev) return null;
    const comment = ev.comments.id(commentId);
    if (!comment) return null;
    comment.deleteOne();
    await ev.save();
    return ev.populate(populateFields);
  }
}

export default new EventsService();
