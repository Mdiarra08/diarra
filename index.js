var peer;
var myStream;

// Fonction pour ajouter une vidéo sans duplication
function ajoutVideo(stream, userId) {
    let existingVideo = document.getElementById(`video-${userId}`);

    // Vérifier si la vidéo existe déjà pour cet utilisateur
    if (!existingVideo) {
        let video = document.createElement('video');
        video.id = `video-${userId}`;
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
    }
}

// Création du peer (utilisateur)
var peer = new Peer();

// Récupération du flux utilisateur (audio + vidéo)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function(stream) {
        myStream = stream; // Stocke le flux local

        // Ajout de la propre vidéo de l'utilisateur
        ajoutVideo(stream, "self");

        // Réception d'un appel entrant
        peer.on('call', function(call) {
            call.answer(myStream); // Répondre avec le flux local

            call.on('stream', function(remoteStream) {
                ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo de l'appelant
            });
        });
    })
    .catch(function(error) {
        console.error("Erreur lors de l'accès à la caméra/micro :", error);
    });

// Fonction pour appeler un utilisateur
function appelUser() {
    var name = document.getElementById('add').value.trim();
    
    if (name) {
        var call = peer.call(name, myStream);
        
        call.on('stream', function(remoteStream) {
            ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'utilisateur appelé
        });

        document.getElementById('add').value = ""; // Réinitialiser l'entrée
    }
}

function register() {
     var name = document.getElementById('name').value;
     try {
         peer = new Peer(name);
         navigator.getUserMedia({video: true, audio: true},
function(stream) {
             myStream = stream;
             ajoutVideo(stream);
             document.getElementById('register').style.display = 'none';
             document.getElementById('userAdd').style.display = 'block';
             document.getElementById('userShare').style.display = 'block';

             peer.on('call', function(call) {
                 call.answer(myStream);
                 call.on('stream', function(remoteStream) {
                     ajoutVideo(remoteStream);
                 });
             });
  }, function(err) {
             console.log('Failed to get local stream', err);
         });

     } catch (error) {
         console.error(error);
     }
}

