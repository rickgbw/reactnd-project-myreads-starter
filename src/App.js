import React from 'react'
import * as BooksAPI from './BooksAPI'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import escapeRegExp from 'escape-string-regexp';
import './App.css'

import Book from './Book';
import Shelf from './Shelf';

class BooksApp extends React.Component {
  state = {
    filter: '',
    currentlyReading: [],
    wantToRead: [],
    read: [],
    query: '',
    results: [],
    error: false
  }

  move = (e, book) => {
    let oldShelf = book.shelf;
    let newShelf = e.target.value;

    BooksAPI.update(book,newShelf)
      .then(() => {
        book.shelf = newShelf;

        this.setState(prevState => {
          let obj = {};
          if(oldShelf !== 'none')
            obj = { [oldShelf]: prevState[oldShelf].filter(b => b.id !== book.id) };
          if(newShelf !== 'none')
            obj = { ...obj, [newShelf]: [...prevState[newShelf], book] };

          return obj;
        });
      });
  }

  handleFilter = ({ target: { value: filter } }) => {
    this.setState({ filter });
  }

  handleSearch = ({ target: { value: query } }) => {
    if(query.trim()) {
      this.setState({ query });

      BooksAPI.search(query)
        .then(results => {
          if(!results.error) {
            //process results only if typed query still the same
            if(query === this.state.query) {
              let shelfs = ['currentlyReading', 'wantToRead', 'read'];

              results.forEach(book => {
                book.shelf = 'none';
                shelfs.forEach(shelf => {
                  if(this.state[shelf].find(b => b.id === book.id))
                    book.shelf = shelf;
                });
              });
            
              this.setState({ results, error: false });
            }
          } else
            this.setState({ error: results.error });
        })
        .catch(err => this.setState({ error: err }));
    } else {
      this.setState({
        query,
        results: []
      });
    }
  };

  componentDidMount() {
    BooksAPI.getAll()
      .then(books => {
        this.setState({
          currentlyReading: books.filter(b => b.shelf === 'currentlyReading'),
          wantToRead: books.filter(b => b.shelf === 'wantToRead'),
          read: books.filter(b => b.shelf === 'read'),
        });
      });
  }

  render() {
    const { 
      filter, 
      currentlyReading, 
      wantToRead, 
      read, 
      query, 
      results,
    } = this.state;
    const match = new RegExp(escapeRegExp(filter), 'i');

    return (
      <Router>
        <div className="app">
          <Route path="/search" render={() => (
            <div className="search-books">
              <div className="search-books-bar">
                <Link className="close-search" to={'/'}>Close</Link>
                <div className="search-books-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Search by title or author"
                    value={query}
                    onChange={this.handleSearch}
                  />
                </div>
              </div>
              <div className="search-books-results">
                { !this.state.error
                  ?
                  <ol className="books-grid">
                    {
                      results.map(book =>
                        <Book key={book.id} book={book} onMove={this.move} />
                      )
                    }
                  </ol>
                  :
                  <strong>Error: {this.state.error}</strong>
                }
              </div>
            </div>
          )}/>
          
          <Route path="/" exact render={() => (
            <div className="list-books">
              <div className="list-books-title">
                <h1>MyReads</h1>
              </div>
              <div 
                className="search-books-bar"
                style={{ position: 'static' }}
              >
                <div className="search-books-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Filter by title"
                    value={filter}
                    onChange={this.handleFilter}
                  />
                </div>
              </div>
              <div className="list-books-content">
                <div>
                  <Shelf 
                    title="Currently Reading" 
                    books={currentlyReading} 
                    match={match} 
                    onMove={this.move}
                  />
                  <Shelf 
                    title="Want to Read" 
                    books={wantToRead} 
                    match={match} 
                    onMove={this.move}
                  />
                  <Shelf 
                    title="Read" 
                    books={read} 
                    match={match} 
                    onMove={this.move}
                  />
                </div>
              </div>
              <div className="open-search">
                <Link to={'/search'}>Add a book</Link>
              </div>
            </div>
          )}/>
        </div>
      </Router>
    )
  }
}

export default BooksApp
