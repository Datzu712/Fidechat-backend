package com.fidechat.repositories;

public interface IRepositoryMethods<K> {
    K findOneById(int id);

    K[] findAll();

    void deleteOneById(int id);

    void updateOneById(int id, K entity);

    void insertOne(K entity);
}
