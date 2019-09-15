const users = [];

const addUser = ({id,username,room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username||!room){
        return {
            error:'username and room is required'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username;
    })

    if(existingUser){
        return {
            error:'username is taken'
        }
    }

    const user = {id,username,room};
    users.push(user);
    return {user}
}

const removeuser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id;
    })

    if(index != -1){
        return users.splice(index,1)[0];
    }
}

const getuser = (id)=>{
    const result = users.find((user)=>{
        return user.id === id;
    })
    return result;
}

const getuserinroom = (room)=>{
    const result = users.filter((user)=>{
        return user.room === room;
    })
    return result;
}


module.exports = {
    addUser,
    getuser,
    getuserinroom,
    removeuser
}