
package com.fidechat.controllers;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Message;
import com.fidechat.entities.Event;
import com.fidechat.entities.EventsEnum;
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
        Event<Message> messageCreate = new Event<Message>(EventsEnum.MESSAGE_CREATE, message);

        webSocketHandler.sendMessageToAllSessions("messageCreate", messageCreate.toJSON());
    }
}