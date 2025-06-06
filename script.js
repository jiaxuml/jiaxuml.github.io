class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.newGameButton = document.getElementById('new-game-button');
        
        // 添加触摸相关变量
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        this.init();
    }

    init() {
        this.addRandomTile();
        this.addRandomTile();
        this.updateScore();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.newGameButton.addEventListener('click', () => this.newGame());

        // 触摸事件
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
    }

    // 处理触摸开始事件
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    // 处理触摸移动事件
    handleTouchMove(event) {
        event.preventDefault(); // 防止页面滚动
    }

    // 处理触摸结束事件
    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.touchEndY = event.changedTouches[0].clientY;
        this.handleSwipe();
    }

    // 处理滑动方向
    handleSwipe() {
        const dx = this.touchEndX - this.touchStartX;
        const dy = this.touchEndY - this.touchStartY;
        
        // 设置最小滑动距离阈值
        const minSwipeDistance = 50;
        
        // 判断滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (Math.abs(dx) > minSwipeDistance) {
                if (dx > 0) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(dy) > minSwipeDistance) {
                if (dy > 0) {
                    this.moveDown();
                } else {
                    this.moveUp();
                }
            }
        }
    }

    handleKeyPress(event) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        
        event.preventDefault();
        const oldGrid = JSON.stringify(this.grid);
        
        switch(event.key) {
            case 'ArrowUp': this.moveUp(); break;
            case 'ArrowDown': this.moveDown(); break;
            case 'ArrowLeft': this.moveLeft(); break;
            case 'ArrowRight': this.moveRight(); break;
        }

        if (oldGrid !== JSON.stringify(this.grid)) {
            this.addRandomTile();
            this.updateScore();
            this.checkGameOver();
        }
    }

    moveLeft() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            this.grid[i] = row;
        }
        this.updateDisplay();
    }

    moveRight() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < 4) row.unshift(0);
            this.grid[i] = row;
        }
        this.updateDisplay();
    }

    moveUp() {
        for (let j = 0; j < 4; j++) {
            let column = this.grid.map(row => row[j]).filter(cell => cell !== 0);
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            while (column.length < 4) column.push(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
        this.updateDisplay();
    }

    moveDown() {
        for (let j = 0; j < 4; j++) {
            let column = this.grid.map(row => row[j]).filter(cell => cell !== 0);
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            while (column.length < 4) column.unshift(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
        this.updateDisplay();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.tileContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.textContent = this.grid[i][j];
                    tile.setAttribute('data-value', this.grid[i][j]);
                    tile.style.left = `${j * 25}%`;
                    tile.style.top = `${i * 25}%`;
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreDisplay.textContent = this.bestScore;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }

    checkGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }

        // 检查是否还能合并
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return;
            }
        }

        // 游戏结束
        setTimeout(() => {
            alert('游戏结束！你的得分是：' + this.score);
        }, 300);
    }

    newGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.updateScore();
        this.init();
    }
}

// 启动游戏
new Game2048(); 