var _ = require('lodash');
var util = require('util');
var FeedBase = require('./feed-base');
var Exceptions = require('../exceptions');

function MediaCommentsFeed(session, mediaId, limit) {
    this.mediaId = mediaId;
    this.limit = limit;
    FeedBase.apply(this, arguments);
}
util.inherits(MediaCommentsFeed, FeedBase);

module.exports = MediaCommentsFeed;
var Request = require('../request');
var Comment = require('../comment');


MediaCommentsFeed.prototype.get = function () {
    var that = this;
    return new Request(that.session)
        .setMethod('GET')
        .setResource('mediaComments', {
            mediaId: that.mediaId,
            maxId: that.getCursor()
        })
        .send()
        .then(function(data) {
            // I am not shure that comments next_max_id is olways object
            // but sometimes it is
            var next_max_id
            try {
                next_max_id = JSON.parse(data.next_max_id).server_cursor
            } catch (err) {
                next_max_id = data.next_max_id
            }
            that.moreAvailable = data.has_more_comments && !!next_max_id;
            if (that.moreAvailable) {
                that.setCursor(next_max_id);
            }
            return _.map(data.comments, function (comment) {
                return new Comment(that.session, comment);
            });
        })
        .catch(function (reason) {
            if(reason.json.message === 'Media is unavailable')throw new Exceptions.MediaUnavailableError();
            else throw reason;
        })
};
