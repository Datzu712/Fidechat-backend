package com.fidechat.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidechat.database.models.Channel;
import com.fidechat.database.models.UserModel;
import com.fidechat.repositories.ChannelRepository;
import com.fidechat.repositories.UserRepository;
import com.fidechat.utils.RequestContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/channels")
@CrossOrigin(origins = "*")
public class ChannelsController {
    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public ChannelsController(ChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    @RequestMapping("/")
    public List<Channel> getChannels(@CookieValue("token") String token) {
        UserModel currentUser = RequestContext.getCurrentUser();

        return channelRepository.findAllFor(currentUser.getId());
    }

    @PostMapping("/")
    public String createChannel(@RequestBody Channel newChannel) {
        this.channelRepository.insertOne(newChannel);

        return "{\"message\": \"success\"}";
    }
    
}
