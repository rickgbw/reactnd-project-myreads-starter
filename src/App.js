import React from 'react'
import * as BooksAPI from './BooksAPI'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import escapeRegExp from 'escape-string-regexp';
import classNames from 'classnames';
import './App.css'

import Book from './Book';

class BooksApp extends React.Component {
  state = {
    filter: '',
    currentlyReading: [],
    wantToRead: [],
    read: [],
    showCurrentlyReading: true,
    showWantToRead: true,
    showRead: true,
    query: '',
    results: [],
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
    this.setState({ query });

    if(query) {
      BooksAPI.search(query)
        .then(results => {
          let shelfs = ['currentlyReading', 'wantToRead', 'read'];

          results.forEach(book => {
            book.shelf = 'none';
            shelfs.forEach(shelf => {
              if(this.state[shelf].find(b => b.id === book.id))
                book.shelf = shelf;
            });
          });

          this.setState({ results });
        });
    } else {
      this.setState({
        searchResults: []
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
      showCurrentlyReading,
      showWantToRead,
      showRead,
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
                <ol className="books-grid">
                  {
                    results.map(book =>
                      <Book key={book.id} book={book} onMove={this.move} />
                    )
                  }
                </ol>
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
                  <div className="bookshelf">
                    <div 
                      className="bookshelf-header"
                      onClick={() => this.setState({ showCurrentlyReading: !showCurrentlyReading })}
                    >
                      <h2 className="bookshelf-title">Currently Reading</h2>
                      <div
                        className={classNames('hamburger-shelf', { 'open-shelf': !showCurrentlyReading, 'close-shelf': showCurrentlyReading })}
                      ></div>
                    </div>
                    <div 
                      className={classNames('bookshelf-books', { 'bookshelf-books-close': !showCurrentlyReading })}
                    >
                      <ol className="books-grid">
                        {
                          currentlyReading
                            .filter(book => match.test(book.title))
                            .map(book =>
                              <Book key={book.id} book={book} onMove={this.move} />
                            )
                        }
                      </ol>
                    </div>
                  </div>
                  <div className="bookshelf">
                    <div 
                      className="bookshelf-header"
                      onClick={() => this.setState({ showWantToRead: !showWantToRead })}
                    >
                      <h2 className="bookshelf-title">Want to Read</h2>
                      <div
                        className={classNames('hamburger-shelf', { 'open-shelf': !showWantToRead, 'close-shelf': showWantToRead })}
                      ></div>
                    </div>
                    <div 
                      className={classNames('bookshelf-books', { 'bookshelf-books-close': !showWantToRead })}
                    >
                      <ol className="books-grid">
                        {
                          wantToRead
                            .filter(book => match.test(book.title))
                            .map(book =>
                              <Book key={book.id} book={book} onMove={this.move} />
                            )
                        }
                      </ol>
                    </div>
                  </div>
                  <div className="bookshelf">
                    <div 
                      className="bookshelf-header"
                      onClick={() => this.setState({ showRead: !showRead })}
                    >
                      <h2 className="bookshelf-title">Read</h2>
                      <div
                        className={classNames('hamburger-shelf', { 'open-shelf': !showRead, 'close-shelf': showRead })}
                      ></div>
                    </div>
                    <div 
                      className={classNames('bookshelf-books', { 'bookshelf-books-close': !showRead })}
                    >
                      <ol className="books-grid">
                        { 
                          read
                            .filter(book => match.test(book.title))
                            .map(book =>
                              <Book key={book.id} book={book} onMove={this.move} />
                            )
                        }
                      </ol>
                    </div>
                  </div>
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
