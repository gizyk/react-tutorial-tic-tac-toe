import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={"square" + (props.highlight ? " square-highlight" : "")} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function ToggleSortButton(props) {
  return (
    <button onClick={props.onClick}>
      Sort: {props.sortAscending ? "Ascending" : "Descending"}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i, highlight) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={highlight}
      />
    );
  }

  render() {
    const rows = [];
    for(let i = 0; i < 3; i++) {
      const squares = [];
      for(let j = 0; j < 3; j++) {
        const elementIndex = (i*3 + j);
        const winner = (this.props.highlight && this.props.highlight.includes(elementIndex));
        squares.push(
          this.renderSquare(elementIndex, winner)
        );  
      }
      rows.push(<div className="board-row">{squares}</div>);
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      sortAscending: true,
      highlight: undefined,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState(
    {
      history: history.concat([
        {
          squares: squares,
          clickedIndex: i,
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }, 
    this.handleWinner(squares)
    );
    
  }

  handleWinner(squares) {
    const winner = calculateWinner(squares);
      if(winner){
        this.setState({
          highlight: winner,
        });
      }
  }

  handleToggleSortButtonClick() {
    this.setState({
      sortAscending: !this.state.sortAscending,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      highlight: calculateWinner(this.state.history[step].squares),
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " " + createLocationFormat(step.clickedIndex) :
        'Go to game start';
      const isSelected = (step === current);
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{isSelected ? React.createElement("strong", {}, desc) : desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + current.squares[winner[0]];
    } else {
      
      if(current.squares.includes(null)) {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      } else {
        status = "It's a draw !";
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            highlight={this.state.highlight}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{this.state.sortAscending ? moves : moves.reverse()}</ol>
          <ToggleSortButton sortAscending={this.state.sortAscending} onClick={()=> this.handleToggleSortButtonClick()}/>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a,b,c];
    }
  }
  return null;
}

function createLocationFormat(index) {
  return "(" + (Math.floor(index/3) + 1) + "," + (index%3 + 1) + ")";
}