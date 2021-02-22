import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import { Switch, Link, Route, useHistory } from "react-router-dom";
import Post from "./components/Post";
import NewForm from "./components/NewForm";
import EditForm from "./components/EditForm";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  let history = useHistory();

  const clonePosts = (posts) => {
    return posts.map((el) => {
      return {
        ...el,
        comments: [...el.comments],
      };
    });
  };

  useEffect(() => {
    const options = {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch("http://10.0.0.6:3000/posts/all", { options })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  // Change published status
  const publish = (e) => {
    e.preventDefault();

    const id = e.target.getAttribute("data-id");

    // Find which post to change published on
    let index;
    const filteredPost = posts.filter((el, i) => {
      if (el._id === id) {
        index = i;
      }
      return el._id === id;
    })[0];

    const options = {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, published: filteredPost.published }),
    };
    // Change published status on server
    fetch(`http://localhost:3000/posts/${id}/publish`, options)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          clonedPosts.splice(index, 1, data.post);
          setPosts(clonedPosts);
        }
      });
  };

  let postsDisplay = [];
  if (posts.length) {
    postsDisplay = posts.map((post) => {
      return (
        <li key={post._id} className="post">
          <Link to={`/${post._id}`}>
            <h1>{post.title}</h1>
            <p className="date">{new Date(post.date).toLocaleDateString()}</p>
            {post.published ? (
              <div className="published">
                <p>Status: Published</p>
                <button onClick={publish} data-id={post._id}>
                  Change
                </button>
              </div>
            ) : (
              <div className="published">
                <p>Status: Unpublished</p>
                <button onClick={publish} data-id={post._id}>
                  Change
                </button>
              </div>
            )}
          </Link>
        </li>
      );
    });
  }

  // Save form values to state
  const [comment, setComment] = useState({
    username: "",
    text: "",
  });

  const handleInput = (e) => {
    setComment({
      ...comment,
      [e.target.name]: e.target.value,
    });
  };

  // Submit comment form
  const addComment = (e) => {
    e.preventDefault();

    const id = e.target.getAttribute("data-id");

    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    };
    // Save new comment on server database
    fetch(`http://localhost:3000/posts/${id}/comment`, options)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let index;
        // Find which post to add comment to and its index in state array
        const filteredPost = posts.filter((el, i) => {
          if (el._id === id) {
            index = i;
          }
          return el._id === id;
        })[0];

        // If successfully added to database add to react state
        if (data.status === "Success") {
          // Update state immutably
          const clonedPosts = clonePosts(posts);
          clonedPosts.splice(index, 1, {
            ...filteredPost,
            comments: [
              ...filteredPost.comments,
              {
                ...comment,
                date: Date.now(),
              },
            ],
          });
          setPosts(clonedPosts);

          // Reset form
          setComment({
            username: "",
            text: "",
          });
        }
      });
  };

  // New Post form values
  const [postForm, setPostForm] = useState({
    title: "",
    text: "",
    published: false,
  });

  // Handle input from new post form
  const handlePostInput = (e) => {
    // If clicked on checkboxes
    if (e.target.name === "publish") {
      setPostForm({
        ...postForm,
        [e.target.name]: "true" === e.target.value,
      });

      // Typing in inputs
    } else {
      setPostForm({
        ...postForm,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Submit new post
  const newPost = (e) => {
    e.preventDefault();
    console.log(postForm);

    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postForm),
    };

    // Save new post to server
    fetch(`http://localhost:3000/posts`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          setPosts([...clonedPosts, data.newPost]);
          history.push("/");
        }
      });
  };

  // Delete Post
  const deletePost = (e) => {
    const id = e.target.getAttribute("data-id");

    // Find index of which post to delete
    let index;
    const filteredPost = posts.filter((el, i) => {
      if (el._id === id) {
        index = i;
      }
      return el._id === id;
    })[0];

    const options = {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    };

    // Delete post from server
    fetch(`http://localhost:3000/posts/${id}`, options)
      .then((res) => res.json())
      .then((data) => {
        // Delete from state
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          clonedPosts.splice(index, 1);
          history.replace("/");
          setPosts(clonedPosts);
        }
      });
  };

  // Edit form state
  const [editPost, setEditPost] = useState({
    title: "",
    text: "",
    published: false,
  });

  // Set values of pre filled edit form data
  const startEditing = (id) => {
    const filteredPost = posts.filter((el) => {
      return el._id === id;
    })[0];
    setEditPost({
      title: filteredPost.title,
      text: filteredPost.text,
      published: filteredPost.published,
    });
  };

  // Handle input change
  const handleEditInput = (e) => {
    if (e.target.name === "published") {
      setEditPost({
        ...editPost,
        [e.target.name]: "true" === e.target.value,
      });
    } else {
      setEditPost({
        ...editPost,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Handle submission of edit form data
  const handleEditSubmit = (e) => {
    const id = e.target.getAttribute("data-id");

    // Find index of which post to update
    let index;
    const filteredPost = posts.filter((el, i) => {
      if (el._id === id) {
        index = i;
      }
      return el._id === id;
    })[0];
    e.preventDefault();
    console.log(editPost);
    const options = {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...editPost }),
    };
    fetch(`http://localhost:3000/posts/${id}`, options)
      .then((res) => res.json())
      .then((data) => {
        // Change post in state
        history.push(`/${id}`);
        const clonedPosts = clonePosts(posts);
        clonedPosts.splice(index, 1, data.editedPost);
        setPosts(clonedPosts);
      });
  };

  return loading ? (
    <p>Loading</p>
  ) : (
    <div className="App">
      <Switch>
        <Route path="/new">
          <NewForm
            newPost={newPost}
            handlePostInput={handlePostInput}
            postForm={postForm}
          />
        </Route>
        <Route path="/:id/edit">
          <EditForm
            postForm={postForm}
            posts={posts}
            startEditing={startEditing}
            handleEditInput={handleEditInput}
            editPost={editPost}
            handleEditSubmit={handleEditSubmit}
          />
        </Route>
        <Route path="/:id">
          <Post
            posts={posts}
            addComment={addComment}
            handleInput={handleInput}
            comment={comment}
            deletePost={deletePost}
          />
        </Route>
        <Route exact path="/">
          <div className="title">
            <h1>My Blog Posts</h1>
            <Link to="/new">New Post</Link>
          </div>
          <ul>{postsDisplay}</ul>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
