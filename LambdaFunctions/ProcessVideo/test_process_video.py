from process_video import group_actors
import unittest
import json

lebowski_input = [
    {
        "timestamp": 0,
        "info": {
            "actorId": "18ir8e0",
            "name": "Jeff Bridges",
            "urls": [
                "www.imdb.com/name/nm0000313",
                "www.wikidata.org/wiki/Q174843"
            ]
        }
    },
    {
        "timestamp": 0,
        "info": {
            "actorId": "3bH4eA5d",
            "name": "John Goodman",
            "urls": [
                "www.wikidata.org/wiki/Q215072"
            ]
        }

    },
    {
        "timestamp": 20000,
        "info": {
            "actorId": "18ir8e0",
            "name": "Jeff Bridges",
            "urls": [
                "www.imdb.com/name/nm0000313",
                "www.wikidata.org/wiki/Q174843"
            ]
        }
    },
    {
        "timestamp": 25000,
        "info": {
            "actorId": "3k2Xl",
            "name": "Steve Buscemi",
            "urls": [
                "www.wikidata.org/wiki/Q104061",
                "www.imdb.com/name/nm0000114"
            ]
        }
    },
    {
        "timestamp": 33000,
        "info": {
            "actorId": "3bH4eA5d",
            "name": "John Goodman",
            "urls": [
                "www.wikidata.org/wiki/Q215072"
            ]
        }

    }
]

lebowski_expected = [
    {
        "start": 0,
        "end": 0,
        "actors": [
            {
                "actorId": "18ir8e0",
                "name": "Jeff Bridges",
                "urls": [
                    "www.imdb.com/name/nm0000313",
                    "www.wikidata.org/wiki/Q174843"
                ]
            },
            {
                "actorId": "3bH4eA5d",
                "name": "John Goodman",
                "urls": [
                    "www.wikidata.org/wiki/Q215072"
                ]
            }
        ]
    },
    {
        "start": 20000,
        "end": 33000,
        "actors": [
            {
                "actorId": "18ir8e0",
                "name": "Jeff Bridges",
                "urls": [
                    "www.imdb.com/name/nm0000313",
                    "www.wikidata.org/wiki/Q174843"
                ]
            },
            {
                "actorId": "3k2Xl",
                "name": "Steve Buscemi",
                "urls": [
                    "www.wikidata.org/wiki/Q104061",
                    "www.imdb.com/name/nm0000114"
                ]
            },
            {
                "actorId": "3bH4eA5d",
                "name": "John Goodman",
                "urls": [
                    "www.wikidata.org/wiki/Q215072"
                ]
            }
        ]
    }
]

seinfeld_input = [
    {
        "timestamp": 0,
        "info": {
            "actorId": "someId123",
            "name": "Jerry Seinfeld",
            "urls": [
                "www.imdb.com/name/nm0000632"
            ]
        }
    },
    {
        "timestamp": 2500,
        "info": {
            "actorId": "3x599H",
            "name": "Michael Richards",
            "urls": [
                "www.wikidata.org/wiki/Q314945",
                "www.imdb.com/name/nm0724245"
            ]
        }
    },
    {
        "timestamp": 25000,
        "info": {
            "actorId": "someId123",
            "name": "Jerry Seinfeld",
            "urls": [
                "www.imdb.com/name/nm0000632"
            ]
        }
    },
    {
        "timestamp": 27000,
        "info": {
            "actorId": "4qm02P",
            "name": "Julia Louis-Dreyfus",
            "urls": [
                "www.wikidata.org/wiki/Q232072",
                "www.imdb.com/name/nm0000506"
            ]
        }
    },
    {
        "timestamp": 27050,
        "info": {
            "actorId": "4qm02P",
            "name": "Julia Louis-Dreyfus",
            "urls": [
                "www.wikidata.org/wiki/Q232072",
                "www.imdb.com/name/nm0000506"
            ]
        }
    },
    {
        "timestamp": 29400,
        "info": {
            "actorId": "4qm02P",
            "name": "Julia Louis-Dreyfus",
            "urls": [
                "www.wikidata.org/wiki/Q232072",
                "www.imdb.com/name/nm0000506"
            ]
        }
    },
    {
        "timestamp": 31000,
        "info": {
            "actorId": "someId123",
            "name": "Jerry Seinfeld",
            "urls": [
                "www.imdb.com/name/nm0000632"
            ]
        }
    },
    {
        "timestamp": 40000,
        "info": {
            "actorId": "3x599H",
            "name": "Michael Richards",
            "urls": [
                "www.wikidata.org/wiki/Q314945",
                "www.imdb.com/name/nm0724245"
            ]
        }
    },
    {
        "timestamp": 50000,
        "info": {
            "actorId": "3x599H",
            "name": "Michael Richards",
            "urls": [
                "www.wikidata.org/wiki/Q314945",
                "www.imdb.com/name/nm0724245"
            ]
        }
    },
    {
        "timestamp": 50000,
        "info": {
            "actorId": "someId123",
            "name": "Jerry Seinfeld",
            "urls": [
                "www.imdb.com/name/nm0000632"
            ]
        }
    },
]

seinfeld_expected = [
    {
        "start": 0,
        "end": 2500,
        "actors": [
            {
                "actorId": "someId123",
                "name": "Jerry Seinfeld",
                "urls": [
                    "www.imdb.com/name/nm0000632"
                ]
            },
            {
                "actorId": "3x599H",
                "name": "Michael Richards",
                "urls": [
                    "www.wikidata.org/wiki/Q314945",
                    "www.imdb.com/name/nm0724245"
                ]
            }
        ]
    },
    {
        "start": 25000,
        "end": 40000,
        "actors": [
            {
                "actorId": "someId123",
                "name": "Jerry Seinfeld",
                "urls": [
                    "www.imdb.com/name/nm0000632"
                ]
            },
            {
                "actorId": "4qm02P",
                "name": "Julia Louis-Dreyfus",
                "urls": [
                    "www.wikidata.org/wiki/Q232072",
                    "www.imdb.com/name/nm0000506"
                ]
            },
            {
                "actorId": "3x599H",
                "name": "Michael Richards",
                "urls": [
                    "www.wikidata.org/wiki/Q314945",
                    "www.imdb.com/name/nm0724245"
                ]
            }
        ]
    },
    {
        "start": 50000,
        "end": 50000,
        "actors": [
            {
                "actorId": "3x599H",
                "name": "Michael Richards",
                "urls": [
                    "www.wikidata.org/wiki/Q314945",
                    "www.imdb.com/name/nm0724245"
                ]
            },
            {
                "actorId": "someId123",
                "name": "Jerry Seinfeld",
                "urls": [
                    "www.imdb.com/name/nm0000632"
                ]
            }
        ]
    }
]


class TestGroupActors(unittest.TestCase):

    def setUp(self) -> None:
        return super().setUp()

    def test_lebowski(self):
        res = group_actors(lebowski_input)
        self.assertListEqual(res, lebowski_expected)
    
    def test_seinfeld(self):
        res = group_actors(seinfeld_input)
        print(json.dumps(res, indent=2))
        self.assertListEqual(res, seinfeld_expected)