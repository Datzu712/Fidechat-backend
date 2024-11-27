
package com.fidechat.controllers;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private WebSocketHandler webSocketHandler;

    @PostMapping
    public void createMessage(@RequestBody Message message) {
        // Save the message to the database (not implemented)
        // Trigger the messageCreate event
        webSocketHandler.sendMessageToAllSessions("messageCreate", message);
    }
}