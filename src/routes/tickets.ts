import { Router } from 'express';
import { getAllTickets, createTicket, getTicketById, updateTicketStatus } from '../dal/tickets.js';
import { getTotalHoursForTicket , insertTimeLog } from '../dal/timeLogs.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async function (req,res){
    let limit = req.query.limit;
    let offset = req.query.offset;
    let status = req.query.status;

    const parsedLimit = limit !== undefined ? Number(limit) : undefined;
    const parsedOffset = offset !== undefined ? Number(offset) : undefined;

    if (parsedLimit !== undefined && Number.isNaN(parsedLimit)) {
        return res.status(400).json({ error: "bad request - limit must be a number" });
    }
    if (parsedOffset !== undefined && Number.isNaN(parsedOffset)) {
        return res.status(400).json({ error: "bad request - offset must be a number" });
    }
    if (status !== undefined && typeof status !== "string") {
        return res.status(400).json({ error: "bad request - status must be a string" });
    }

    const tickets = await getAllTickets({"limit": parsedLimit,  "offset": parsedOffset,  "status": status});
    res.json(tickets)
});

// GET /tickets/:id

router.get('/:id', async function (req,res){
    const id = req.params.id;
    const checkedID = +id;
    if (Number.isNaN(checkedID)){
        return res.status(400).json({error:"bad request - id must be a number"});
    }
    const ticket = await getTicketById(checkedID);
    if (!ticket){
        return res.status(404).json({error : "ticket not found"});
    }
    res.json(ticket);
});
// POST /tickets

router.post('/', authMiddleware, async function (req,res){
    const creator_id = res.locals.userID;

    const { title, description } =  req.body;
    if (!title){
        return res.status(400).json( { error : "bad request - title is required"});
    }
    
    await createTicket( {title : title, creator_id : creator_id, description : description} );
    res.status(201).json({"status" : "created"});
});
// PATCH /tickets/:id/status

router.patch('/:id/status', authMiddleware, async function (req,res){
    const ticketId = req.params.id;
    const checkedId = +ticketId;
    if (Number.isNaN(checkedId)){
        return res.status(400).json({error : "bad request - id must be a number"});
    }
    const status = req.query.status;
    if (!status){
        return res.status(400).json({error : "bad request - status is required"});
    } else if (typeof status !== "string"){
        return res.status(400).json({error: "bad request - status must be a string"});
    }
    await updateTicketStatus(checkedId,status);
    res.status(200).json({"status":"ok"});
});

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
// GET /tickets/:id/time

// POST /tickets/:id/time
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async function (req, res) {
    const ticketId = Number(req.params.id);
    if (Number.isNaN(ticketId)) {
        return res.status(400).json({ error: "bad request - id must be a number" });
    }

    const { hours } = req.body;
    if (!Number.isInteger(hours) || hours <= 0) {
        return res.status(400).json({ error: "bad request - hours must be a positive integer" });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
        return res.status(404).json({ error: "ticket not found" });
    }

    const timeLog = await insertTimeLog(ticketId, res.locals.userID, hours);
    return res.status(201).json(timeLog);
});

// GET /tickets/:id/time
router.get('/:id/time', async function (req, res) {
    const ticketId = Number(req.params.id);
    if (Number.isNaN(ticketId)) {
        return res.status(400).json({ error: "bad request - id must be a number" });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
        return res.status(404).json({ error: "ticket not found" });
    }

    const total = await getTotalHoursForTicket(ticketId);
    return res.json({ ticket_id: ticketId, total_hours: total });
});

export default router;
