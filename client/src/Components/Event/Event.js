import React, { useState, useEffect, Fragment } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';

import SwipeableViews from 'react-swipeable-views';

import {
  getEvent,
  getAttendants,
  postAttendant,
  deleteAttendant,
  getComments,
  postComment,
} from '../../logic/api';
import { groupComments, buildValidationErrorsObject } from '../../logic/utils';

import { useUser } from '../UserProvider/UserProvider';

import TabPanel from '../TabPanel/TabPanel';
import EventDetails from '../EventDetails/EventDetails';
import CommentCard from '../CommentCard/CommentCard';
import CommentForm from '../CommentForm/CommentForm';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

import Style from '../Style/Style';

const Event = ({ match }) => {
  const style = Style();
  const user = useUser();

  const [value, setValue] = useState(0);
  const [event, setEvent] = useState(null);
  const [attendants, setAttendants] = useState(null);
  const [updateAttendants, setUpdateAttendants] = useState(true);
  const [comments, setComments] = useState(null);
  const [updateComments, setUpdateComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);

  const id = match.params.eventId;
  useEffect(() => {
    setLoading(true);
    setError(null);
    getEvent(id)
      .then((data) => setEvent(data.event))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (updateAttendants) {
      setError(null);
      getAttendants(id)
        .then((data) => setAttendants(data.attendants))
        .catch((error) => setError(error))
        .finally(() => {
          setUpdateAttendants(false);
          setLoading(false);
        });
    }
  }, [id, updateAttendants]);

  useEffect(() => {
    if (updateComments) {
      getComments(id)
        .then((data) => setComments(groupComments(data.comments)))
        .catch((error) => setError(error))
        .finally(() => {
          setUpdateComments(false);
          setLoading(false);
        });
    }
  }, [id, updateComments]);

  const handleAttendantsClick = () => {
    setLoading(true);
    setError(null);
    if (userAttending) {
      const attendant = attendants.filter(
        (attendant) => attendant.user._id === user._id
      )[0];
      const nonPopulatedAttendant = {
        event: attendant.event,
        user: attendant.user._id,
      };

      deleteAttendant(id, attendant._id, nonPopulatedAttendant)
        .then(() => setUpdateAttendants(true))
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    } else {
      postAttendant(id, {
        event: id,
        user: user._id,
      })
        .then(() => setUpdateAttendants(true))
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    }
  };

  const handleCommentsClick = (
    commentContent,
    handleCommentContentChange,
    parentComment
  ) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    const comment = {
      event: id,
      user: user._id,
      content: commentContent,
    };
    if (parentComment) {
      comment.parentComment = parentComment;
    }

    postComment(id, comment)
      .then((data) => {
        if (data.errors) {
          setError('The form contains errors');
          setValidationErrors(buildValidationErrorsObject(data.errors));
          setLoading(false);
        } else {
          setUpdateComments(true);
          handleCommentContentChange('');
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const futureEvent = event && new Date(event.startDate) >= new Date();

  const restrictedDisplay =
    futureEvent && user && (user._id === event.createdBy || user.admin);

  const userAttending =
    user &&
    attendants &&
    attendants.some((attendant) => attendant.user._id === user._id);

  return (
    <Fragment>
      {loading && <LinearProgress />}
      {event && user && (
        <div className={style.root}>
          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="h2">Event</Typography>
            </Grid>
            <Grid item style={{ width: '100%' }}>
              <Paper>
                <AppBar position="static" color="default">
                  <Tabs
                    value={value}
                    onChange={(event, newValue) => setValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                  >
                    <Tab label="Details" />
                    <Tab label="Comments" />
                  </Tabs>
                </AppBar>
                <SwipeableViews
                  index={value}
                  onChangeIndex={(index) => setValue(index)}
                >
                  <TabPanel value={value} index={0}>
                    <EventDetails
                      event={event}
                      restrictedDisplay={restrictedDisplay}
                      futureEvent={futureEvent}
                      userAttending={userAttending}
                      handleClick={handleAttendantsClick}
                      attendants={attendants}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    {userAttending ? (
                      <Grid
                        container
                        direction="column"
                        alignItems="center"
                        spacing={2}
                      >
                        <Grid item>
                          <CommentForm
                            parentComment={null}
                            handleClick={handleCommentsClick}
                            validationErrors={validationErrors}
                          />
                        </Grid>
                        {comments &&
                          comments.map((commentsGroup) => (
                            <Grid item key={commentsGroup.comment._id}>
                              <CommentCard
                                commentsGroup={commentsGroup}
                                handleClick={handleCommentsClick}
                                validationErrors={validationErrors}
                              />
                            </Grid>
                          ))}
                      </Grid>
                    ) : (
                      <div className={style.center}>
                        <Typography variant="body1">
                          Only attendants can read and post comments.
                        </Typography>
                        {futureEvent && (
                          <Button
                            style={{ marginTop: '16px' }}
                            variant="contained"
                            color="primary"
                            onClick={() => handleAttendantsClick()}
                          >
                            I will attend!
                          </Button>
                        )}
                      </div>
                    )}
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
      {error && <ErrorSnackbar error={error} />}
    </Fragment>
  );
};

export default Event;