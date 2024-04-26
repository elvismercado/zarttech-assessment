import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  //   templateUrl: './app.component.html',
  template: `
    <div id="statusArea" className="status">
      Next player: <span>{{ currentPlayer }}</span>
    </div>
    <div id="winnerArea" className="winner">
      Winner: <span> {{ winner }} </span>
    </div>
    <button (click)="reset()">Reset</button>
    <section>
      <div class="row" *ngFor="let row of [1, 2, 3]" style="height:40px;">
        <button
          *ngFor="let col of [1, 2, 3]"
          class="square"
          style="width:40px;height:100%;"
          (click)="squareClicked(row, col)"
        >
          {{ grid[row - 1][col - 1] || ' ' }}&nbsp;
          <!-- Adding space character in buttons to avoid dimension changes when changing values of each cell -->
        </button>
      </div>
    </section>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // code goes here

  // I will try to not modify the given template as much as possible to try and make something functional with the given template

  // counting up as turns take place, which will also dictate which players turn it is
  private _currentPlayer$: Subject<number> = new Subject<number>();
  private _turn: number = 0;
  currentPlayer: number = 1;
  grid: string[][] = [Array(3), Array(3), Array(3)]; // using a 2d array to follow the game
  winner: string = '';
  pause: boolean = false;

  ngOnInit() {
    this.setupGame();
    this.nextTurn();
  }

  ngOnDestroy() {
    this.stopSubscriptions();
  }

  reset() {
    this.setupGame();
    this.nextTurn();
  }

  squareClicked(row: number, col: number) {
    if (this.winner || this.pause || this.grid[row - 1][col - 1]) {
      return;
    }

    if (this.currentPlayer % 2 === 1) {
      this.grid[row - 1][col - 1] = 'X';
    } else {
      this.grid[row - 1][col - 1] = 'O';
    }

    this.hasWon();
    this.checkGridFull();
    this.nextTurn();
  }

  private setupGame() {
    this._turn = 0;
    if (this._currentPlayer$) {
      this._currentPlayer$.unsubscribe();
    }
    this._currentPlayer$ = new Subject<number>();
    this.currentPlayer = 0;
    this.winner = '';
    this.pause = false;
    this.createGrid();
    this._currentPlayer$.subscribe((value) => {
      // alternating between player 1 and 2 based on the current turn
      // 0 means even so that would be player 2
      this.currentPlayer = (value % 2) + 1;
    });
  }

  //   TODO: refactor?
  private hasWon() {
    const player = this.currentPlayer % 2 === 1 ? 'X' : 'O';

    // check rows
    let topLeftToBottomRight = 0;
    let bottomLeftToTopRight = 0;
    for (let i = 0; i < 3; i++) {
      let rows = 0;
      let columns = 0;
      for (let j = 0; j < 3; j++) {
        if (this.grid[i][j] === player) {
          rows++;
        }
        if (this.grid[j][i] === player) {
          columns++;
        }
        if (i === j && this.grid[i][j] === player) {
          // looking at a grid and numbering the cells with an index shows that the i and j values are equal on this diagobal
          topLeftToBottomRight++;
        }
        if (i + j === 2 && this.grid[i][j] === player) {
          // looking at a grid and numbering the cells with an index shows that adding i and j together is always 2
          bottomLeftToTopRight++;
        }
      }
      if (
        rows === 3 ||
        columns === 3 ||
        topLeftToBottomRight === 3 ||
        bottomLeftToTopRight === 3
      ) {
        this.winner = `Player ${this.currentPlayer % 2 === 1 ? 1 : 2}`;
        return;
      }
    }
  }

  // Check if the board is already full
  private checkGridFull() {
    let full = true;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!this.grid[i][j]) {
          full = false;
        }
      }
    }

    if (full) {
      this.pause = true;
    }
  }

  private nextTurn() {
    if (this.winner || this.pause) {
      return;
    }

    // passing current turn to determine player
    // taking advantage of `++` first returning value of `turn` before incrementing
    this._currentPlayer$.next(this._turn++);
  }

  private createGrid() {
    // create grid
    this.grid = [];
    for (let i = 0; i < 3; i++) {
      const row: any[] = [];
      for (let j = 0; j < 3; j++) {
        row.push('');
      }
      this.grid.push(row);
    }
  }

  private stopSubscriptions() {
    if (this._currentPlayer$) {
      this._currentPlayer$.unsubscribe();
    }
  }
}
