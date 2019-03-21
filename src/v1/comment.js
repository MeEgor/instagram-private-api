import { plainToClass } from 'class-transformer';
import { User } from '../models/user';
import { Request } from '../core/request';

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
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(data)
  return hmac.digest('binary')
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
  static create (session, mediaId, text) {
    return session.getAccountId().then(accountId => {
      return new Request(session)
        .setMethod('POST')
        .setResource('comment', { id: mediaId })
        .generateUUID()
        .setData({
          user_breadcrumb: generateUserBreadcrumb(text),
          idempotence_token: crypto.createHash('md5').update(text).digest('hex'),
          _uid: accountId,
          comment_text: text,
          radio_type: 'wifi-none',
          containermodule: 'comments_feed_timeline',
        })
        .signPayload()
        .send()
    })
    .then(data => new Comment(session, data.comment))
  }

  static delete (session, mediaId, commentId) {
    return new Request(session)
      .setMethod('POST')
      .setResource('commentDelete', { id: mediaId, commentId })
      .generateUUID()
      .setData({
        media_id: mediaId,
        src: 'profile',
        idempotence_token: crypto
          .createHash('md5')
          .update(commentId)
          .digest('hex'),
      })
      .signPayload()
      .send()
      .then(data => data);
  }

  static bulkDelete (session, mediaId, commentIds) {
    return new Request(session)
      .setMethod('POST')
      .setResource('commentBulkDelete', { id: mediaId })
      .generateUUID()
      .setData({
        media_id: mediaId,
        comment_ids_to_delete: commentIds.join(','),
        src: 'profile',
        idempotence_token: crypto
          .createHash('md5')
          .update(commentIds.join(','))
          .digest('hex'),
      })
      .signPayload()
      .send()
      .then(data => data);
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
