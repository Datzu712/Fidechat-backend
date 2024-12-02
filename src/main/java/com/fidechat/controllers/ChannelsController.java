package com.fidechat.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Channel;
import com.fidechat.database.models.Message;
import com.fidechat.database.models.UserModel;
import com.fidechat.entities.Event;
import com.fidechat.entities.EventsEnum;
import com.fidechat.repositories.ChannelRepository;
import com.fidechat.repositories.UserRepository;
import com.fidechat.utils.RequestContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/channels")
@CrossOrigin(origins = "*")
public class ChannelsController {
    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private WebSocketHandler webSocketHandler;

    @GetMapping
    public List<Channel> getChannels(@CookieValue("token") String token) {
        UserModel currentUser = RequestContext.getCurrentUser();

        List<Channel> channels = channelRepository.findAllFor(currentUser.getId());
        for (Channel channel : channels) {
            List<Message> messages = this.channelRepository.getMessagesFrom(channel.getId());
            channel.setMessages(messages);
        }

        return channels;
    }

    @PostMapping
    public String createChannel(@RequestBody Channel newChannel) {
        String newChannelId = this.channelRepository.insertOne(newChannel);
        if (newChannelId == null) {
            System.out.println("Error creating channel");
            return "{\"message\": \"error\"}";
        }
        newChannel.setId(newChannelId);
        Event<String> eventPayload = new Event<>(EventsEnum.CHANNEL_CREATE, newChannel.toJSON());

        webSocketHandler.handleChannelCreate(newChannel.getOwnerId(), eventPayload.toJSON());

        return "{\"message\": \"success\"}";
    }
    
}
