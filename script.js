document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const rows = 8;
    const cols = 8;
    let cells = [];
    let selectedPiece = null;
    let currentPlayer = 'red';

    function createBoard() {
        board.innerHTML = ''; // Clear the board
        cells = []; // Reset the cells array
        for (let row = 0; row < rows; row++) {
            cells[row] = [];
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if ((row + col) % 2 === 0) {
                    cell.classList.add('light');
                } else {
                    cell.classList.add('dark');
                    if (row < 3) {
                        const piece = createPiece('black');
                        cell.appendChild(piece);
                    } else if (row > 4) {
                        const piece = createPiece('red');
                        cell.appendChild(piece);
                    }
                }
                cell.addEventListener('click', () => movePiece(cell));
                board.appendChild(cell);
                cells[row][col] = cell;
            }
        }
    }

    function createPiece(color) {
        const piece = document.createElement('div');
        piece.classList.add('piece', color);
        piece.dataset.type = 'man';
        piece.addEventListener('click', (e) => {
            e.stopPropagation();
            selectPiece(piece);
        });
        return piece;
    }

    function selectPiece(piece) {
        if (piece.classList.contains(currentPlayer)) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
            }
            selectedPiece = piece;
            piece.classList.add('selected');
        }
    }

    function movePiece(targetCell) {
        if (!selectedPiece || targetCell.childElementCount > 0 || !targetCell.classList.contains('dark')) {
            return;
        }

        const originCell = selectedPiece.parentElement;
        const originCoords = getCellCoords(originCell);
        const targetCoords = getCellCoords(targetCell);

        if (isValidMove(originCoords, targetCoords)) {
            const capturedPieces = getCapturedPieces(originCoords, targetCoords);
            if (capturedPieces.length) {
                capturedPieces.forEach(piece => piece.remove());
            }

            targetCell.appendChild(selectedPiece);
            selectedPiece.classList.remove('selected');
            promotePiece(targetCoords, selectedPiece);
            selectedPiece = null;
            
            if (capturedPieces.length && canCaptureAgain(targetCoords)) {
                selectPiece(targetCell.querySelector('.piece'));
            } else {
                switchPlayer();
            }

            if (checkWinCondition()) {
                setTimeout(resetGame, 1000, `${currentPlayer.toUpperCase()} wins!`);
            } else if (checkDeadlockCondition()) {
                setTimeout(resetGame, 1000, 'Deadlock! Game is a draw.');
            }
        }
    }

    function getCellCoords(cell) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cells[row][col] === cell) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    function isValidMove(origin, target) {
        const rowDiff = target.row - origin.row;
        const colDiff = target.col - origin.col;
        const pieceType = selectedPiece.dataset.type;

        if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1 && pieceType === 'man') {
            return (currentPlayer === 'red' && rowDiff === -1) || (currentPlayer === 'black' && rowDiff === 1);
        } else if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1 && pieceType === 'king') {
            return true;
        } else if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            const midRow = (origin.row + target.row) / 2;
            const midCol = (origin.col + target.col) / 2;
            const midCell = cells[midRow][midCol];
            const midPiece = midCell.querySelector('.piece');

            return midPiece && !midPiece.classList.contains(currentPlayer);
        }
        return false;
    }

    function getCapturedPieces(origin, target) {
        const capturedPieces = [];
        const rowDiff = target.row - origin.row;
        const colDiff = target.col - origin.col;

        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            const midRow = (origin.row + target.row) / 2;
            const midCol = (origin.col + target.col) / 2;
            const midCell = cells[midRow][midCol];
            const midPiece = midCell.querySelector('.piece');
            if (midPiece && !midPiece.classList.contains(currentPlayer)) {
                capturedPieces.push(midPiece);
            }
        }
        return capturedPieces;
    }

    function promotePiece(coords, piece) {
        if ((currentPlayer === 'red' && coords.row === 0) || (currentPlayer === 'black' && coords.row === 7)) {
            piece.dataset.type = 'king';
            piece.classList.add('king');
        }
    }

    function canCaptureAgain(coords) {
        const directions = [
            { row: 2, col: 2 },
            { row: 2, col: -2 },
            { row: -2, col: 2 },
            { row: -2, col: -2 }
        ];

        for (const direction of directions) {
            const newRow = coords.row + direction.row;
            const newCol = coords.col + direction.col;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                const targetCell = cells[newRow][newCol];
                if (targetCell.childElementCount === 0) {
                    const midRow = (coords.row + newRow) / 2;
                    const midCol = (coords.col + newCol) / 2;
                    const midCell = cells[midRow][midCol];
                    const midPiece = midCell.querySelector('.piece');
                    if (midPiece && !midPiece.classList.contains(currentPlayer)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
    }

    function checkWinCondition() {
        const opponentPieces = document.querySelectorAll(`.piece.${currentPlayer === 'red' ? 'black' : 'red'}`);
        return opponentPieces.length === 0;
    }

    function checkDeadlockCondition() {
        const currentPieces = document.querySelectorAll(`.piece.${currentPlayer}`);
        for (const piece of currentPieces) {
            const coords = getCellCoords(piece.parentElement);
            const directions = [
                { row: 1, col: 1 },
                { row: 1, col: -1 },
                { row: -1, col: 1 },
                { row: -1, col: -1 }
            ];
            for (const direction of directions) {
                const newRow = coords.row + direction.row;
                const newCol = coords.col + direction.col;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const targetCell = cells[newRow][newCol];
                    if (targetCell.childElementCount === 0 || (targetCell.childElementCount > 0 && targetCell.firstChild.classList.contains(currentPlayer))) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function resetGame(message) {
        alert(message);
        selectedPiece = null;
        currentPlayer = 'red';
        createBoard();
    }

    createBoard();
});
