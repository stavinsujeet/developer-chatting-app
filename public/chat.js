        const socket = io();

        //code to send and recieve location acknowledgement
        const linkTemplate = document.getElementById("link-template").innerHTML;
        const locBtn = document.getElementById("loc");
        
        //code for sending and reciving messages
        const chat = document.getElementById("chatform");
        const messagetext = document.getElementById("message");
        const sendBtn = document.getElementById("messageBtn");
        const messages = document.getElementById("messages");

        const scroll = ()=>{
            //new message element
            const newmessage =  messages.lastElementChild;

            //height of new message
            const newMessageStyle = getComputedStyle(newmessage);
            const newMessageMargin = parseInt(newMessageStyle.marginBottom)
            const newmessageheight = newmessage.offsetHeight + newMessageMargin;
        
            //visible height
            const visibleHeight = messages.offsetHeight;

            //height of messages container
            const containerHeight = messages.scrollHeight;

            //how far we have scroll
            const scrolloffset = messages.scrollTop + visibleHeight;
            if(containerHeight - newmessageheight <= scrolloffset){
                messages.scrollTop = messages.scrollHeight;
            }
        }
                
        //getting template
        const messageTemplate = document.getElementById("message-template").innerHTML;
        
        locBtn.addEventListener("click",()=>{
            if(!navigator.geolocation){
               return alert("not supported in browser");
            }
            navigator.geolocation.getCurrentPosition((position)=>{
                locBtn.setAttribute("disabled","true");
                socket.emit("sendLocation",{
                    lat:position.coords.latitude,
                    lon:position.coords.longitude
                },()=>{
                    locBtn.removeAttribute("disabled");
                })
            })
        })

        const st = document.getElementById("st").innerHTML;

        socket.on("locationMessage",(loc)=>{
            // console.log(loc);
            const html = Mustache.render(linkTemplate,{
                link:loc.message,
                createdAt:moment(loc.createdAt).format('h:mm a'),
                username:loc.username
            })
            messages.insertAdjacentHTML("beforeend",html);
            scroll();
        })

        chat.addEventListener("submit",(e)=>{
            e.preventDefault();

            socket.emit("sendMessage",messagetext.value,(err)=>{
                if(err){
                    return console.log(err);
                }
                messagetext.value = '';
                messagetext.focus();
                sendBtn.removeAttribute("disabled");
            });
        })
        socket.on("message",(message)=>{
            console.log(message);
            const html = Mustache.render(messageTemplate,{
                message:message.message,
                createdAt:moment(message.createdAt).format('h:mm a'),
                username:message.username
            });
            messages.insertAdjacentHTML('beforeend',html);
            scroll()
        })

        //options
        const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

        socket.emit("join",{username,room},(error)=>{
            if(error){
                alert(error);
                location.href = "/"
            }
        });

        socket.on("roomdata",({room,users})=>{
            console.log(users);
            const html = Mustache.render(st,{
                room,
                users
            })
            document.getElementById("sidebar").innerHTML = html;
        })