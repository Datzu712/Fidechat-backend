package com.fidechat.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @CrossOrigin(origins = "*")
    @GetMapping
    public List<Channel> getChannels(@CookieValue("token") String token) throws SQLException {
        UserModel currentUser = RequestContext.getCurrentUser();

        List<Channel> channels = channelRepository.findAllFor(currentUser.getId());
        for (Channel channel : channels) {
            List<Message> messages = this.channelRepository.getMessagesFrom(channel.getId());
            channel.setMessages(messages);
        }

        return channels;
    }

    @CrossOrigin(origins = "*")
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

    @CrossOrigin(origins = "*")
    @PatchMapping("/{channelId}")
    public ResponseEntity<String> updateChannel(@RequestBody Channel updatedChannel, @PathVariable("channelId") String channelId) throws SQLException {
        Channel targetChannel = this.channelRepository.findOneById(channelId);
        if (targetChannel == null || !targetChannel.getOwnerId().equals(RequestContext.getCurrentUser().getId())) {
            return ResponseEntity.notFound().build();
        }

        if (updatedChannel.getDescription() == null) {
            updatedChannel.setDescription(targetChannel.getDescription());
        }

        if (updatedChannel.getName() == null) {
            updatedChannel.setName(targetChannel.getName());
        }

        boolean success = this.channelRepository.updateOneById(channelId, updatedChannel);
        if (!success) {
            System.out.println("Error updating channel");
            return ResponseEntity.badRequest().body("{\"message\": \"error\"}");
        }

        List<Message> messages = this.channelRepository.getMessagesFrom(channelId);
        updatedChannel.setMessages(messages);

        updatedChannel
            .setOwnerId(targetChannel.getOwnerId())
            .setId(channelId);

        Event<String> eventPayload = new Event<>(EventsEnum.CHANNEL_UPDATE, updatedChannel.toJSON());
        List<String> members = this.channelRepository.findAllMembers(channelId)
            .stream()
            .map(UserModel::getId)
            .toList();

        this.webSocketHandler.handleEvent(members, eventPayload);

        return ResponseEntity.ok("{\"message\": \"success\"}");
    }
    
}
