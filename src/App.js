import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import { Switch, Link, Route, useHistory } from "react-router-dom";
import Post from "./components/Post";
import NewForm from "./components/NewForm";
import EditForm from "./components/EditForm";
import Login from "./components/Login";
import Auth from "./components/Auth";
import Spinner from "./components/Spinner";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  let history = useHistory();
  const baseUrl = "https://blog-api22.herokuapp.com";

  // Clone posts immutably
  const clonePosts = (posts) => {
    return posts.map((el) => {
      return {
        ...el,
        comments: [...el.comments],
      };
    });
  };

  // Get all posts
  useEffect(() => {
    const options = {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch(`${baseUrl}/posts/all`, options)
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
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ id, published: filteredPost.published }),
    };
    // Change published status on server
    fetch(`${baseUrl}/posts/${id}/publish`, options)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          clonedPosts.splice(index, 1, data.post);
          setPosts(clonedPosts);
        }
      })
      .catch((err) => {
        if (err.message === "Unauthorized") {
          history.push("/login");
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
    fetch(`${baseUrl}/posts/${id}/comment`, options)
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
                ...data.comment,
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
    if (e.target.name === "published") {
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
    setLoading(true);

    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(postForm),
    };

    // Save new post to server
    fetch(`${baseUrl}/posts`, options)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "Success") {
          // Save to react state
          const clonedPosts = clonePosts(posts);
          setPosts([...clonedPosts, data.newPost]);
          history.push("/");

          // Reset form data
          setPostForm({
            title: "",
            text: "",
            published: false,
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.message === "Unauthorized") {
          history.push("/login");
        }
      });
  };

  // Delete Post
  const deletePost = (e) => {
    const id = e.target.getAttribute("data-id");
    setLoading(true);
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
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ id }),
    };

    // Delete post from server
    fetch(`${baseUrl}/posts/${id}`, options)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        // Delete from state
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          clonedPosts.splice(index, 1);
          history.replace("/");
          setPosts(clonedPosts);
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.message === "Unauthorized") {
          history.push("/login");
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
    setLoading(true);

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
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ id, ...editPost }),
    };
    fetch(`${baseUrl}/posts/${id}`, options)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        // Change post in state
        history.push(`/${id}`);
        const clonedPosts = clonePosts(posts);
        clonedPosts.splice(index, 1, data.editedPost);
        setPosts(clonedPosts);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.message === "Unauthorized") {
          history.push("/login");
        }
      });
  };

  // Delete comment
  const deleteComment = (id, commentId) => {
    // Find index of which post to update
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
        Authorization: `Bearer ${auth.token}`,
      },
    };
    fetch(`${baseUrl}/posts/${id}/comment/${commentId}`, options)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        // Change post in state
        if (data.status === "Success") {
          const clonedPosts = clonePosts(posts);
          const filteredComments = filteredPost.comments.filter((el) => {
            return el._id !== commentId;
          });
          clonedPosts[index].comments = filteredComments;
          setPosts(clonedPosts);
        }
      })
      .catch((err) => {
        if (err.message === "Unauthorized") {
          history.push("/login");
        }
      });
  };

  // Login form values
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // Login form input handler
  const loginFormInput = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const [auth, setAuth] = useState({});

  // Log user in on form submission
  const login = (e) => {
    e.preventDefault();
    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginForm),
    };
    fetch(`${baseUrl}/posts/login`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Auth Passed") {
          setAuth({
            ...auth,
            token: data.token,
            loggedIn: true,
            expires: data.expires,
          });
          // Store token in local storage
          localStorage.setItem("token", data.token);
          localStorage.setItem("expires", Date.now() + data.expires * 1000);
          setLoginForm({
            username: "",
            password: "",
          });
          history.push("/");
        }
      })
      .catch((err) => {
        console.log("ERROR", err);
      });
  };

  // Auto login with local storage if possible on start
  const getToken = () => {
    const token = localStorage.getItem("token");
    const expires = localStorage.getItem("expires");
    if (Date.now() < Number(expires)) {
      setAuth({ token, loggedIn: true });
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  return loading ? (
    <Spinner></Spinner>
  ) : (
    <div className="App">
      <ScrollToTop />
      <Switch>
        <Route path="/login">
          <Login
            login={login}
            loginForm={loginForm}
            loginFormInput={loginFormInput}
          />
        </Route>
        <Route path="/new">
          <Auth auth={auth}>
            <NewForm
              newPost={newPost}
              handlePostInput={handlePostInput}
              postForm={postForm}
            />
          </Auth>
        </Route>
        <Route path="/:id/edit">
          <Auth auth={auth}>
            <EditForm
              postForm={postForm}
              posts={posts}
              startEditing={startEditing}
              handleEditInput={handleEditInput}
              editPost={editPost}
              handleEditSubmit={handleEditSubmit}
            />
          </Auth>
        </Route>
        <Route path="/:id">
          <Auth auth={auth}>
            <Post
              posts={posts}
              addComment={addComment}
              handleInput={handleInput}
              comment={comment}
              deletePost={deletePost}
              deleteComment={deleteComment}
            />
          </Auth>
        </Route>
        <Route exact path="/">
          <Auth auth={auth}>
            <div className="title">
              <h1>My Blog Posts</h1>
              <Link to="/new">New Post</Link>
            </div>
            <ul>{postsDisplay}</ul>
          </Auth>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
