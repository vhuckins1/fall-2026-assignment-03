import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
router.get('/', async function (req,res){
    const users = await getAllUsers();
    res.json(users);
});

// GET /users/:id

router.get('/:id', async function (req,res){
    const userID = req.params.id;
    const checkedUserID = +userID;
    if (Number.isNaN(checkedUserID)){
        return res.status(400).json( { error : "bad request: userID must be a number"} );
    }
    const user = await getUserById(checkedUserID);
    if (!user){
        return res.status(404).json( { error : "user not found" } );
    }
    res.json(user);
});

// POST /users

router.post('/', authMiddleware, async function (req,res){
    const { name , email } = req.body;
    if (!name || !email){
        return res.status(400).json({error : "bad request - name and email required"})
    }
    await createUser( {name : name, email : email} );
    res.status(201).json({status : "created"});
});

export default router;
