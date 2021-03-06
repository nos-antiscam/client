from boa.interop.Neo.Storage import Get, Put, Delete, GetContext
from boa.interop.Neo.Runtime import Log, Notify, CheckWitness
from boa.builtins import concat, list, range, take, substr

def Main(operation, args):
    """
    :param operation: The name of the operation to perform
    :param args: A list of arguments along with the operation
    :type operation: str
    :type args: list
    :return: The result of the operation
    :rtype: bytearray
    """
    if operation == 'get_all_comments':
        address = args[0]
        comment_target_key = concat(address, ".comment.target")
        return get_address_comments(comment_target_key, '')
    owner_hash = args[0]
    owner_address = args[1]
    fav_target_key = concat(owner_address, ".fav.target")
    if operation == 'check' or operation == 'check_flag' or 'fetch':
        authorized = True
    else:
        authorized = CheckWitness(owner_hash)
    if not authorized:
        Log("Not Authorized")
        return False
    Log("Authorized")
    if operation == 'fetch':
        return do_fetch(fav_target_key)
    elif operation == 'add':
        address = args[2]
        return add_to_target(fav_target_key, address)
    elif operation == 'check':
        address = args[2]
        result = check_in_target(fav_target_key, address)
        return result[1]
    elif operation == 'remove':
        address = args[2]
        return delete_from_target(fav_target_key, address)
    elif operation == 'flag':
        address = args[2]
        flag_target_key = concat(address, ".flag.target")
        return add_to_target(flag_target_key, owner_address)
    elif operation == 'unflag':
        address = args[2]
        flag_target_key = concat(address, ".flag.target")
        return delete_from_target(flag_target_key, owner_address)
    elif operation == 'check_flag':
        address = args[2]
        flag_target_key = concat(address, ".flag.target")
        return check_in_target(flag_target_key, owner_address)
    elif operation == 'add_comment':
        address = args[2]
        comment = args[3]
        comment_target_key = concat(address, ".comment.target")
        return add_comment(comment_target_key, owner_address, comment)
    elif operation == 'get_comments':
        address = args[2]
        comment_target_key = concat(address, ".comment.target")
        return get_address_comments(comment_target_key, owner_address)
    else:
        Notify('unknown operation')
        return False


def do_fetch(target):
    """
    Fetch current favorite list value from storage.
    :return: the stored list value
    :rtype: list
    """
    context = GetContext()
    list_bytes = Get(context, target)
    return deserialize_bytearray(list_bytes)


def add_to_target(target, address):
    """
    Add 1 favorite into the list in storage.
    :return: indication success execution of the command
    :rtype: bool
    """
    context = GetContext()
    list_bytes = Get(context, target)
    if not list_bytes:
        item_list = list(length=0)
    else:
        item_list = deserialize_bytearray(list_bytes)
    item_list.append(address)
    list_length = len(item_list)
    Notify('new list length:')
    Notify(list_length)
    list_bytes = serialize_array(item_list)
    Put(context, target, list_bytes)
    return True

def delete_from_target(target, address):
    context = GetContext()
    list_bytes = Get(context, target)
    item_list = deserialize_bytearray(list_bytes)
    list_length = len(item_list)
    new_list = list(length=0)
    for item in item_list:
        if item!=address:
            new_list.append(item)
    Notify('new list length:')
    Notify(len(new_list))
    list_bytes = serialize_array(new_list)
    Put(context, target, list_bytes)
    return True


def check_in_target(target, address):
    context = GetContext()
    list_bytes = Get(context, target)
    return check_bytearray(list_bytes, address)
    # Notify('Item First:')
    # Notify(item_list[0])
    # return address == item_list[0]

def add_comment(target, address, comment):
    context = GetContext()
    list_bytes = Get(context, target)
    if not list_bytes:
        item_list = list(length=0)
    else:
        item_list = deserialize_bytearray(list_bytes)
    Notify('item list:')
    Notify(item_list)
    find_address_res = find_address_comments(item_list, address)
    if find_address_res[0]:
        index = find_address_res[1]
        comments_list = find_address_res[2]
        Notify('index:')
        Notify(index)
        Notify('comments_list')
        Notify(item_list)
        Notify('new item list:')
        Notify(item_list)
        comments_list[1] = comments_list[1] + 1
        comments_list.append(comment)
        item_list[index] = serialize_array(comments_list)
    else:
        comments_list = list(length=2)
        comments_list[0] = address
        comments_list[1] = 1
        comments_list.append(comment)
        item_list.append(serialize_array(comments_list))
    Notify('new item list2:')
    Notify(item_list)
    list_length = len(item_list)
    Notify('new list length2:')
    Notify(list_length)
    list_bytes = serialize_array(item_list)
    Put(context, target, list_bytes)
    return True

def get_address_comments(target, address):
    context = GetContext()
    list_bytes = Get(context, target)
    if not list_bytes:
        item_list = list(length=0)
        return item_list
    else:
        item_list = deserialize_bytearray(list_bytes)
    find_address_res = find_address_comments(item_list, address)
    return find_address_res[2]


def find_address_comments(item_list, address):
    if len(item_list) == 0:
        return [False, -1, list(length=0)]
    i = 0
    comments_list_list = list(length=0)
    # Notify("item_list=")
    # Notify(item_list)
    for item in item_list:
        comment_list = deserialize_bytearray(item)
        comment_address = comment_list[0]
        if address and address == comment_address:
            return [True, i, comment_list]
        if not address:
            comments_list_list.append(comment_list)
        i+=1
    Notify("comments_list_list=")
    Notify(comments_list_list)
    if len(comments_list_list) == 0:
        return [False, -1, list(length=0)]
    if not address:
        return [True, i, comments_list_list]

def deserialize_bytearray(data):

    # get length of length
    collection_length_length = data[0:1]

    # get length of collection
    collection_len = data[1:collection_length_length + 1]

    # create a new collection
    new_collection = list(length=collection_len)

    # trim the length data
    offset = 1 + collection_length_length

    for i in range(0, collection_len):

        # get the data length length
        itemlen_len = data[offset:offset + 1]

        # get the length of the data
        item_len = data[offset + 1:offset + 1 + itemlen_len]

        # get the data
        item = data[offset + 1 + itemlen_len: offset + 1 + itemlen_len + item_len]

        # store it in collection
        new_collection[i] = item

        offset = offset + item_len + itemlen_len + 1

    return new_collection

def check_bytearray(data, member):
    # get length of length
    collection_length_length = data[0:1]

    # get length of collection
    collection_len = data[1:collection_length_length + 1]

    # create a new collection
    new_collection = list(length=collection_len)

    # trim the length data
    offset = 1 + collection_length_length

    for i in range(0, collection_len):

        # get the data length length
        itemlen_len = data[offset:offset + 1]

        # get the length of the data
        item_len = data[offset + 1:offset + 1 + itemlen_len]

        # get the data
        item = data[offset + 1 + itemlen_len: offset + 1 + itemlen_len + item_len]

        # store it in collection
        if item == member:
            return [collection_len, True]

        offset = offset + item_len + itemlen_len + 1
    return [collection_len, False]

def serialize_array(items):

    # serialize the length of the list
    itemlength = serialize_var_length_item(items)

    output = itemlength

    # now go through and append all your stuff
    for item in items:

        # get the variable length of the item
        # to be serialized
        itemlen = serialize_var_length_item(item)

        # add that indicator
        output = concat(output, itemlen)

        # now add the item
        output = concat(output, item)

    # return the stuff
    return output


def serialize_var_length_item(item):

    # get the length of your stuff
    stuff_len = len(item)

    # now we need to know how many bytes the length of the array
    # will take to store

    # this is one byte
    if stuff_len <= 255:
        byte_len = b'\x01'
    # two byte
    elif stuff_len <= 65535:
        byte_len = b'\x02'
    # hopefully 4 byte
    else:
        byte_len = b'\x04'

    out = concat(byte_len, stuff_len)

    return out

