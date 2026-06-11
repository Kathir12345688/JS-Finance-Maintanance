from copy import copy

from django.template.context import BaseContext


def _patched_basecontext_copy(self):
    """Work around Django 4.2.30 / Python 3.14 RequestContext copy bug."""
    duplicate = object.__new__(self.__class__)
    duplicate.__dict__.update(self.__dict__)
    duplicate.dicts = self.dicts[:]
    return duplicate


BaseContext.__copy__ = _patched_basecontext_copy
