const pldl = require("play-dl");
const musicEmbed = require("../../Util/music/musicEmbed.js");
const {
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
} = require("@discordjs/voice");
module.exports = class MusicConnection {
  constructor(voiceConnection, client, lastChannelId) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.nowPlaying = 0;
    this.readylock = false;
    this.queuelock = false;
    this.loop = 0;
    this.client = client;
    this.lastChannelId = lastChannelId;
    //fix for player stopped at around 40s playing
    const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
      const newUdp = Reflect.get(newNetworkState, "udp");
      clearInterval(newUdp?.keepAliveInterval);
    };

    this.voiceConnection.on("stateChange", async (_, newState) => {
      const oldNetworking = Reflect.get(oldState, "networking");
      const newNetworking = Reflect.get(newState, "networking");

      oldNetworking.off("stateChange", networkStateChangeHandler);
      newNetworking.on("stateChange", networkStateChangeHandler);

      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          /*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              5_000
            );
            // Probably moved voice channel
          } catch {
            this.voiceConnection.destroy();
            // Probably removed from voice channel
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          /*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
          await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
          this.voiceConnection.rejoin();
        } else {
          /*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
          this.voiceConnection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        /*
					Once destroyed, stop the subscription
				*/
        this.stop();
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
        /*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
        this.readyLock = true;
        try {
          await entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Ready,
            20_000
          );
        } catch {
          // if (
          //   this.voiceConnection.state.status !==
          //   VoiceConnectionStatus.Destroyed
          // )
          //   this.voiceConnection.destroy();
        } finally {
          this.readyLock = false;
        }
      }
    });
    // Configure audio player
    this.audioPlayer.on("stateChange", (oldState, newState) => {
      console.log(oldState.status, newState.status);
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        if (this.queue.length > 0) {
          this.nowPlaying += 1;
        }
        console.log(this.nowPlaying, this.queue);

        if (this.nowPlaying <= this.queue.length - 1) {
          this.processQueue();
        }
        // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
        // The queue is then processed to start playing the next track, if one is available.
      } else if (newState.status === AudioPlayerStatus.Playing) {
        // If the Playing state has been entered, then a new track has started playback.
        //TODO on track started
      }
    });
    this.audioPlayer.on("error", (error) => {
      console.log(error);
    });
    voiceConnection.subscribe(this.audioPlayer);
  }

  addSong(song) {
    this.queue.push(song);
    this.processQueue();
  }

  stop() {
    this.queueLock = true;
    this.queue = [];
    this.nowPlaying = 0;
    this.audioPlayer.stop(true);
  }

  clear() {
    this.queue = [];
    this.nowPlaying = 0;
  }

  jump(queueNumber) {
    // If the user use jump when player idle
    if (this.audioPlayer.state.status == AudioPlayerStatus.Idle) {
      this.nowPlaying = queueNumber - 1;
      this.processQueue();
      return;
    }
    // If the user use jump when player is still playing,
    // queueNumber -2 because stop will make the player think the song finished,
    // player on finish will do "this.nowPlaying +=1"
    this.nowPlaying = queueNumber - 2;
    this.audioPlayer.stop();
  }

  remove(songNumber) {
    this.queue.splice(songNumber - 1, 1);
    if (songNumber - 1 < this.nowPlaying) {
      this.nowPlaying -= 1;
    } else if (songNumber - 1 === 0 && songNumber - 1 === this.nowPlaying) {
      this.audioPlayer.stop();
    } else if (songNumber - 1 === this.nowPlaying) {
      this.nowPlaying -= 1;
      this.audioPlayer.stop();
    }
  }

  leave() {
    this.queue = [];
    this.nowPlaying = 0;
    this.audioPlayer.stop(true);
    this.voiceConnection.destroy();
  }

  async processQueue() {
    // If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }
    // Lock the queue to guarantee safe access
    this.queueLock = true;
    if (this.nowPlaying < this.queue.length) {
      try {
        const song = await pldl
          .stream(this.queue[this.nowPlaying].url, {
            quality: 1,
          })
          .then(console.log("got the stream"));
        console.log(song.type);
        const nextSong = createAudioResource(song.stream, {
          inputType: song.type,
        });
        this.audioPlayer.play(nextSong);
        await this.client.channels.cache.get(this.lastChannelId).send({
          embeds: [
            musicEmbed.message(`Playing ${this.queue[this.nowPlaying].title}`),
          ],
        });
        this.queueLock = false;
      } catch (error) {
        this.queueLock = false;
        await this.client.channels.cache.get(this.lastChannelId).send({
          embeds: [musicEmbed.message(error.message)],
        });
      }
    }
  }
};
