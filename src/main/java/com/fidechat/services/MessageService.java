package com.fidechat.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fidechat.WebSocketHandler;
import com.fidechat.database.models.Channel;
import com.fidechat.database.models.Message;
import com.fidechat.database.models.UserModel;
import com.fidechat.entities.Event;
import com.fidechat.entities.EventsEnum;
import com.fidechat.repositories.ChannelRepository;
import com.fidechat.repositories.MessageRepository;

@Service
public class MessageService {
    @Autowired
    private WebSocketHandler webSocketHandler;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    public ResponseEntity<String> createMessage(String channelId, Message msg) {
        Channel targetChannel = this.channelRepository.findOneById(channelId);
        if (targetChannel == null) {
            return new ResponseEntity<>("{\"error\": \"Channel not found\"}", HttpStatus.NOT_FOUND);
        }
        
        List<Channel> viewableChannels = this.channelRepository.findAllFor(msg.getAuthorId());
        if (viewableChannels.stream().noneMatch(c -> c.getId().equals(channelId))) {
            return new ResponseEntity<>("{\"error\": \"You do not have permission to post in this channel\"}", HttpStatus.FORBIDDEN);
        }

        msg.setChannelId(channelId);
        this.messageRepository.insertOne(msg);

        Event<String> eventPayload = new Event<>(EventsEnum.MESSAGE_CREATE, msg.toJSON());
        // UserModel::getId = user -> user.getId()
        List<String> members = this.channelRepository.findAllMembers(channelId).stream().map(UserModel::getId).collect(Collectors.toList());

        this.webSocketHandler.handleEvent(members, eventPayload);

        return new ResponseEntity<>("{ \"message\": \"Message created\" }", HttpStatus.CREATED);
    }
}
