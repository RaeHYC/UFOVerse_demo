const config = {
    type: Phaser.AUTO,
    width: 1000, // Base width
    height: 600, // Base height
    scale: {
        mode: Phaser.Scale.FIT, // Auto-scaling mode
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the canvas
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

const game = new Phaser.Game(config);

let background;
let alien1, alien2;
let dropdown, dropdownOpen = false;
let dropdownItems = [];
let keywords = {};
let selectedKeyword = null;
let dropdownGraphics;
let alien1Dialogue, alien2Dialogue;
let scrollOffset = 0;
const visibleItemCount = 5;
let dropdownTextObjects = []; // Array to store text objects

function preload() {
    this.load.image('background', 'assets/images/background.jpg');
    this.load.image('alien1', 'assets/images/Rae.png');
    this.load.image('alien2', 'assets/images/Candace.png');
    this.load.audio('bgmusic', 'assets/audio/background.mp3');
    this.load.json('keywords', 'assets/keywords.json');
}

function create() {
    keywords = this.cache.json.get('keywords');
    dropdownItems = Object.keys(keywords);

    background = this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

    alien2 = this.add.sprite(700, 400, 'alien2').setScale(0.35);
    alien1 = this.add.sprite(800, 400, 'alien1').setScale(0.3).setFlipX(true);

    alien1Dialogue = this.add.text(alien1.x, alien1.y - 100, "", {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    alien2Dialogue = this.add.text(alien2.x, alien2.y - 100, "", {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    dropdownGraphics = this.add.graphics();
    dropdown = this.add.text(50, 50, "Select Keyword", {
        fontSize: '20px',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 }
    }).setInteractive();

    dropdown.on('pointerdown', () => {
        dropdownOpen = !dropdownOpen;
        renderDropdown(this);
    });

    const bgmusic = this.sound.add('bgmusic');
    bgmusic.play({ loop: true });

    this.input.on('pointerdown', (pointer) => {
        if (dropdownOpen) {
            const trackHeight = visibleItemCount * 30; // Total height of the scrollbar track
            const thumbHeight = (visibleItemCount / dropdownItems.length) * trackHeight; // Height of the scrollbar thumb
            const thumbY = 80 + (scrollOffset / (dropdownItems.length - visibleItemCount)) * (trackHeight - thumbHeight);

            // Check if the click is within the thumb's range
            if (pointer.x >= 250 && pointer.x <= 260 && pointer.y >= thumbY && pointer.y <= thumbY + thumbHeight) {
                this.input.on('pointermove', onDrag, this); // Add drag event
            }
        }
    });

    this.input.on('pointerup', () => {
        this.input.off('pointermove', onDrag, this); // Remove drag event
    });

    function onDrag(pointer) {
        if (dropdownOpen) {
            const trackHeight = visibleItemCount * 30; // Total height of the scrollbar track
            const thumbHeight = (visibleItemCount / dropdownItems.length) * trackHeight; // Height of the scrollbar thumb
            const thumbTop = 80; // Top of the scrollbar track
            const thumbBottom = 80 + trackHeight - thumbHeight; // Bottom of the scrollbar track

            // Restrict the thumb's movement range
            if (pointer.y >= thumbTop && pointer.y <= thumbBottom) {
                const newScrollOffset = Math.round(((pointer.y - thumbTop) / (trackHeight - thumbHeight)) * (dropdownItems.length - visibleItemCount));
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    renderDropdown(this); // Re-render the dropdown
                }
            }
        }
    }
}

function update() {
    alien1.x += alien1.flipX ? -1.5 : 1.5;
    if (alien1.x <= 50 || alien1.x >= 950) {
        alien1.flipX = !alien1.flipX;
    }

    if (alien2.jumping) {
        alien2.y -= 3;
        alien2.jumpingTimer -= 1;
        if (alien2.jumpingTimer <= 0) alien2.jumping = false;
    } else {
        alien2.y = 350;
        if (Math.random() < 0.01) {
            alien2.jumping = true;
            alien2.jumpingTimer = 30;
        }
    }

    alien1Dialogue.setPosition(alien1.x, alien1.y - 150);
    alien2Dialogue.setPosition(alien2.x, alien2.y - 150);
}

function renderDropdown(scene) {
    dropdownGraphics.clear();
    dropdownTextObjects.forEach(text => text.destroy());
    dropdownTextObjects = [];

    if (dropdownOpen) {
        const visibleItems = dropdownItems.slice(scrollOffset, scrollOffset + visibleItemCount);

        // Render dropdown background
        dropdownGraphics.fillStyle(0xFFFFFF, 1);
        dropdownGraphics.fillRect(50, 80, 200, visibleItemCount * 30);

        // Render option texts
        for (let i = 0; i < visibleItems.length; i++) {
            const y = 80 + i * 30;
            const text = scene.add.text(60, y + 5, visibleItems[i], {
                fontSize: '14px',
                color: '#000000'
            }).setInteractive();

            text.on('pointerdown', () => {
                selectedKeyword = visibleItems[i];
                dropdown.setText(selectedKeyword);
                dropdownOpen = false;

                alien1Dialogue.setText(keywords[selectedKeyword][1]).setVisible(true);
                alien2Dialogue.setText(keywords[selectedKeyword][0]).setVisible(true);

                scene.time.delayedCall(2000, () => {
                    alien1Dialogue.setVisible(false);
                    alien2Dialogue.setVisible(false);
                });

                renderDropdown(scene);
            });

            dropdownTextObjects.push(text);
        }

        // Render scrollbar track and thumb
        const trackHeight = visibleItemCount * 30; // Total height of the scrollbar track
        const thumbHeight = (visibleItemCount / dropdownItems.length) * trackHeight; // Height of the scrollbar thumb
        const thumbY = 80 + (scrollOffset / (dropdownItems.length - visibleItemCount)) * (trackHeight - thumbHeight);

        // Draw scrollbar track
        dropdownGraphics.fillStyle(0xCCCCCC, 1);
        dropdownGraphics.fillRect(250, 80, 10, trackHeight);

        // Draw scrollbar thumb
        dropdownGraphics.fillStyle(0x999999, 1);
        dropdownGraphics.fillRect(250, thumbY, 10, thumbHeight);
    }
}












