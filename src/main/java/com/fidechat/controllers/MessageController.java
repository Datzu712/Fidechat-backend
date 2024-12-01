
package com.fidechat.controllers;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Message;
import com.fidechat.repositories.ChannelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/channels/{channelId}/messages")
public class MessageController {

    @Autowired
    private WebSocketHandler webSocketHandler;

    @Autowired
    private ChannelRepository channelRepository;

    @PostMapping
    public void createMessage(@RequestBody Message message, @PathVariable String channelId) {
        // Save the message to the database (not implemented)
        // Trigger the messageCreate event
        webSocketHandler.sendMessageToAllSessions("messageCreate", message);
    }
}