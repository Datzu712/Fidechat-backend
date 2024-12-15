
package com.fidechat.controllers;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Message;
import com.fidechat.services.MessageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/channels/{channelId}/messages")
public class MessageController {

    @Autowired
    private WebSocketHandler webSocketHandler;

    @Autowired
    private MessageService messageService;

    @CrossOrigin(origins = "*")
    @PostMapping()
    public ResponseEntity<String> createMessage(@RequestBody Message message, @PathVariable("channelId") String channelId) {
        return this.messageService.createMessage(channelId, message);
    }
}