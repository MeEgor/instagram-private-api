import { plainToClass } from 'class-transformer';
import { User } from '../models/user';
import { Request } from '../core/request';


const Helpers = require('../helpers');
const Resource = require('./resource');
const _ = require('lodash');
const crypto = require('crypto');
const camelKeys = require('camelcase-keys');

function rand(from, to) {
  return from + Math.round(Math.random() * (to - from))
}

function base64encode(string) {
  return Buffer.from(string).toString('base64')
}

function hashHmac(data, key) {
  return crypto.createHmac('SHA256', key).update(data).digest()
}

function generateUserBreadcrumb(text) {
  const size = text.length
  const key = 'iN4$aGr0m'
  const date = Date.now()
  // typing time
  const term = rand(2, 3) * 1000 + size * rand(15, 20) * 100
  // android EditText change event occur count
  var textChangeEventCount = Math.round(size / rand(2, 3))
  if (textChangeEventCount == 0) {
    textChangeEventCount = 1
  }
  // generate typing data
  const data = `${size} ${term} ${textChangeEventCount} ${date}`  

  return `${base64encode(hashHmac(data, key))}\n${base64encode(data)}\n`
}

class Comment extends Resource {

  static async create (session, mediaId, text, moduleName) {
    return new Request(session)
      .setMethod('POST')
      .setResource('comment', { id: mediaId })
      .generateUUID()
      .setData({
        user_breadcrumb: generateUserBreadcrumb(text),
        idempotence_token: Helpers.Helpers.generateUUID(),
        _uid: await session.getAccountId(),
        comment_text: text,
        radio_type: 'wifi-none',
        containermodule: moduleName,
      })
      .signPayload()
      .send()
      .then(data => new Comment(session, data.comment))
  }

  static async delete (session, mediaId, commentId) {
    return new Request(session)
      .setMethod('POST')
      .setResource('commentDelete', { id: mediaId, commentId })
      .generateUUID()
      .setData({
        _uid: await session.getAccountId(),
      })
      .signPayload()
      .send()
      .then(data => data);
  }

  static async bulkDelete (session, mediaId, commentIds) {
    return new Request(session)
      .setMethod('POST')
      .setResource('commentBulkDelete', { id: mediaId })
      .generateUUID()
      .setData({
        _uid: await session.getAccountId(),
        comment_ids_to_delete: commentIds.join(',')
      })
      .signPayload()
      .send()
  }

  static like (session, commentId) {
    return new Request(session)
      .setMethod('POST')
      .setResource('commentLike', { id: commentId })
      .generateUUID()
      .signPayload()
      .send()
      .then(data => data);
  }

  parseParams (json) {
    const hash = camelKeys(json);
    hash.created = json.created_at;
    hash.status = (json.status || 'unknown').toLowerCase();
    hash.id = (json.pk || json.id).toString();
    this.account = plainToClass(User, json.user);
    return hash;
  }

  account () {
    return this.account;
  }

  getParams () {
    return _.defaults(
      {
        account: this.account.params,
      },
      this._params,
    );
  }
}

module.exports = Comment;
