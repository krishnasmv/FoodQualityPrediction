import sys
from src.logger import logging

def error_message_detail(error, error_details:sys):
    _,_, exc_traceback = error_details.exc_info()
    if exc_traceback is None:
        file_name = "Unknown file"
        line_number = "Unknown line"
    else:
        file_name = exc_traceback.tb_frame.f_code.co_filename
        line_number = exc_traceback.tb_lineno
    error_message = "Error in your python file {0} at line {1} and errormessage {2}".format(file_name, line_number, str(error))

    return error_message

class CustomException(Exception):
    def __init__(self, error_message, error_detail:sys):
        super().__init__(error_message)
        self.error_message = error_message_detail(error_message, error_details=error_detail)

    def __str__(self):
        return self.error_message
    