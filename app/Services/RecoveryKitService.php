<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Encryption Key Recovery Kit Service.
 *
 * Uses the BIP39 English wordlist to encode a user's 32-byte encryption key
 * into a human-readable 24-word mnemonic phrase, and to decode it
 * back to the original key. Also provides PDF generation for printing.
 */
class RecoveryKitService
{
    /**
     * The full BIP39 English wordlist (2048 words).
     * Sourced from the official BIP39 specification.
     */
    private const BIP39_WORDS = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
        'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
        'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
        'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
        'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
        'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
        'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
        'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
        'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
        'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
        'arrive', 'arrow', 'art', 'artifact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
        'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
        'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
        'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge',
        'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain',
        'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
        'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit',
        'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology',
        'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless',
        'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
        'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss',
        'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread',
        'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze',
        'broom', 'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
        'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy',
        'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake', 'call',
        'calm', 'camera', 'camp', 'can', 'canal', 'cancel', 'candy', 'cannon', 'canoe', 'canvas',
        'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card', 'cargo', 'carpet', 'carry',
        'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch', 'category',
        'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census', 'century',
        'cereal', 'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge', 'chase',
        'chat', 'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
        'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
        'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk',
        'clever', 'click', 'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close',
        'cloth', 'cloud', 'clown', 'club', 'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut',
        'code', 'coffee', 'coil', 'coin', 'collect', 'color', 'column', 'combine', 'come', 'comfort',
        'comic', 'common', 'company', 'concert', 'conduct', 'confirm', 'congress', 'connect', 'consider', 'control',
        'convince', 'cook', 'cool', 'copper', 'copy', 'coral', 'core', 'corn', 'correct', 'cost',
        'cotton', 'couch', 'country', 'couple', 'course', 'cousin', 'cover', 'coyote', 'crack', 'cradle',
        'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy', 'cream', 'credit', 'creek',
        'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch', 'crowd', 'crucial',
        'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry', 'crystal', 'cube', 'culture', 'cup',
        'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad',
        'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn', 'day', 'deal',
        'debate', 'debris', 'decade', 'december', 'decide', 'decline', 'decorate', 'decrease', 'deer', 'defense',
        'define', 'defy', 'degree', 'delay', 'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny',
        'depart', 'depend', 'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk',
        'despair', 'destroy', 'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond',
        'diary', 'dice', 'diesel', 'diet', 'differ', 'digital', 'dignity', 'dilemma', 'dinner', 'dinosaur',
        'direct', 'dirt', 'disagree', 'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance',
        'divert', 'divide', 'divorce', 'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain',
        'donate', 'donkey', 'donor', 'door', 'dose', 'double', 'dove', 'draft', 'dragon', 'drama',
        'drastic', 'draw', 'dream', 'dress', 'drift', 'drill', 'drink', 'drip', 'drive', 'drop',
        'drum', 'dry', 'duck', 'dumb', 'dune', 'during', 'dust', 'dutch', 'duty', 'dwarf',
        'dynamic', 'eager', 'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo',
        'ecology', 'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight', 'either', 'elbow',
        'elder', 'electric', 'elegant', 'element', 'elephant', 'elevator', 'elite', 'else', 'embark', 'embody',
        'embrace', 'emerge', 'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless',
        'endorse', 'enemy', 'energy', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough',
        'enrich', 'enroll', 'ensure', 'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip',
        'era', 'erase', 'erode', 'erosion', 'error', 'erupt', 'escape', 'essay', 'essence', 'estate',
        'eternal', 'ethics', 'evidence', 'evil', 'evoke', 'evolve', 'exact', 'example', 'exceed', 'exchange',
        'excite', 'exclude', 'excuse', 'execute', 'exercise', 'exhaust', 'exhibit', 'exile', 'exist', 'exit',
        'exotic', 'expand', 'expect', 'expire', 'explain', 'expose', 'express', 'extend', 'extra', 'eye',
        'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith', 'fall', 'false', 'fame',
        'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat', 'fatal', 'father',
        'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female',
        'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field', 'figure', 'file',
        'film', 'filter', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first',
        'fiscal', 'fish', 'fit', 'fitness', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor',
        'flee', 'flight', 'flip', 'float', 'flock', 'floor', 'flower', 'fluid', 'flush', 'fly',
        'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food', 'foot', 'force', 'foreign',
        'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil', 'foster', 'found', 'fox',
        'fragile', 'frame', 'frequent', 'fresh', 'friend', 'fringe', 'frog', 'front', 'frost', 'frown',
        'frozen', 'fruit', 'fuel', 'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain',
        'galaxy', 'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas',
        'gasp', 'gate', 'gather', 'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine',
        'gesture', 'ghost', 'giant', 'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad',
        'glance', 'glare', 'glass', 'glide', 'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow',
        'glue', 'goat', 'goddess', 'gold', 'good', 'goose', 'gorilla', 'gospel', 'gossip', 'govern',
        'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass', 'gravity', 'great', 'green',
        'grid', 'grief', 'grit', 'grocery', 'group', 'grow', 'grunt', 'guard', 'guess', 'guide',
        'guilt', 'guitar', 'gun', 'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand',
        'happy', 'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head',
        'health', 'heart', 'heavy', 'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero',
        'hidden', 'high', 'hill', 'hint', 'hip', 'hire', 'history', 'hobby', 'hockey', 'hold',
        'hole', 'holiday', 'hollow', 'home', 'honey', 'hood', 'hope', 'horn', 'horror', 'horse',
        'hospital', 'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble', 'humor',
        'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'ice', 'icon',
        'idea', 'identify', 'idle', 'ignore', 'ill', 'illegal', 'illness', 'image', 'imitate', 'immense',
        'immune', 'impact', 'impose', 'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index',
        'indicate', 'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject',
        'injury', 'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insane', 'insect', 'inside', 'inspire',
        'install', 'intact', 'interest', 'into', 'invest', 'invite', 'involve', 'iron', 'island', 'isolate',
        'issue', 'item', 'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly',
        'jewel', 'job', 'join', 'joke', 'journey', 'joy', 'judge', 'juice', 'jump', 'jungle',
        'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep', 'ketchup', 'key', 'kick', 'kid',
        'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten', 'kiwi', 'knee',
        'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp',
        'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law', 'lawn',
        'lawsuit', 'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave', 'lecture', 'left', 'leg',
        'legal', 'legend', 'leisure', 'lemon', 'lend', 'length', 'lens', 'leopard', 'lesson', 'letter',
        'level', 'liar', 'liberty', 'library', 'license', 'life', 'lift', 'light', 'like', 'limb',
        'limit', 'link', 'lion', 'liquid', 'list', 'little', 'live', 'lizard', 'load', 'loan',
        'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop', 'lottery', 'loud', 'lounge',
        'love', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics', 'machine',
        'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man',
        'manage', 'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin', 'marine',
        'market', 'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix', 'matter',
        'maximum', 'maze', 'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media', 'melody',
        'melt', 'member', 'memory', 'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh',
        'message', 'metal', 'method', 'middle', 'midnight', 'milk', 'million', 'mimic', 'mind', 'minimum',
        'minor', 'minute', 'miracle', 'mirror', 'misery', 'miss', 'mistake', 'mix', 'mixed', 'mixture',
        'mobile', 'model', 'modify', 'mom', 'moment', 'monitor', 'monkey', 'monster', 'month', 'moon',
        'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor', 'mountain', 'mouse', 'move',
        'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom', 'music', 'must',
        'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin', 'narrow', 'nasty', 'nation',
        'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew', 'nerve', 'nest',
        'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night', 'noble', 'noise',
        'nominee', 'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'novel',
        'now', 'nuclear', 'number', 'nurse', 'nut', 'oak', 'obey', 'object', 'oblige', 'obscure',
        'observe', 'obtain', 'obvious', 'occur', 'ocean', 'october', 'odor', 'off', 'offend', 'offer',
        'office', 'often', 'oil', 'okay', 'old', 'olive', 'olympic', 'omit', 'once', 'one',
        'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose', 'option', 'orange', 'orbit',
        'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan', 'ostrich', 'other', 'outdoor',
        'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner', 'oxygen', 'oyster',
        'ozone', 'pact', 'paddle', 'page', 'pair', 'palace', 'palm', 'panda', 'panel', 'panic',
        'panther', 'paper', 'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path',
        'patient', 'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut', 'pear', 'peasant',
        'pelican', 'pen', 'penalty', 'pencil', 'people', 'pepper', 'perfect', 'permit', 'person', 'pet',
        'phone', 'photo', 'phrase', 'physical', 'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon',
        'pill', 'pilot', 'pink', 'pioneer', 'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet',
        'plastic', 'plate', 'play', 'player', 'pleasure', 'plenty', 'plot', 'plug', 'plunge', 'poem',
        'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony', 'pool', 'popular', 'portion',
        'position', 'possible', 'post', 'potato', 'pottery', 'poverty', 'powder', 'power', 'practice', 'praise',
        'predict', 'prefer', 'prepare', 'present', 'pretty', 'prevent', 'price', 'pride', 'primary', 'print',
        'priority', 'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit', 'program', 'project',
        'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide', 'public', 'pudding', 'pull',
        'pulp', 'pulse', 'pumpkin', 'punch', 'pupil', 'puppy', 'purchase', 'purity', 'purpose', 'purse',
        'push', 'put', 'puzzle', 'pyramid', 'quality', 'quantum', 'quarter', 'question', 'quick', 'quit',
        'quiz', 'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain',
        'raise', 'rally', 'ramp', 'ranch', 'random', 'range', 'rapid', 'rare', 'rate', 'rather',
        'raven', 'raw', 'razor', 'ready', 'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive',
        'recipe', 'record', 'recycle', 'reduce', 'reflect', 'reform', 'refuse', 'region', 'regret', 'regular',
        'reject', 'relax', 'release', 'relief', 'rely', 'remain', 'remember', 'remind', 'remove', 'render',
        'renew', 'rent', 'reopen', 'repair', 'repeat', 'replace', 'report', 'require', 'rescue', 'resemble',
        'resist', 'resource', 'response', 'result', 'retire', 'retreat', 'return', 'reunion', 'reveal', 'review',
        'reward', 'rhythm', 'rib', 'ribbon', 'rice', 'rich', 'ride', 'ridge', 'rifle', 'right',
        'rigid', 'ring', 'riot', 'rip', 'ripe', 'rise', 'risk', 'rival', 'river', 'road',
        'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate',
        'rough', 'round', 'route', 'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway',
        'rural', 'sad', 'saddle', 'sadness', 'safe', 'sail', 'salad', 'salmon', 'salon', 'salt',
        'salute', 'same', 'sample', 'sand', 'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say',
        'scale', 'scan', 'scare', 'scatter', 'scene', 'scheme', 'school', 'science', 'scissors', 'scorpion',
        'scout', 'scrap', 'screen', 'script', 'scrub', 'sea', 'search', 'season', 'seat', 'second',
        'secret', 'section', 'security', 'seed', 'seek', 'segment', 'select', 'sell', 'seminar', 'senior',
        'sense', 'sentence', 'series', 'service', 'session', 'settle', 'setup', 'seven', 'shadow', 'shaft',
        'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine', 'ship', 'shiver',
        'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder', 'shove', 'shrimp', 'shrug', 'shuffle',
        'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign', 'silent', 'silk', 'silly',
        'silver', 'similar', 'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size',
        'skate', 'sketch', 'ski', 'skill', 'skin', 'skirt', 'skull', 'slab', 'slam', 'sleep',
        'slender', 'slice', 'slide', 'slight', 'slim', 'slogan', 'slot', 'slow', 'slush', 'small',
        'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap', 'sniff', 'snow', 'soap',
        'soccer', 'social', 'sock', 'soda', 'soft', 'solar', 'soldier', 'solid', 'solution', 'solve',
        'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south',
        'space', 'spare', 'spatial', 'spawn', 'speak', 'special', 'speed', 'spell', 'spend', 'sphere',
        'spice', 'spider', 'spike', 'spin', 'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport',
        'spot', 'spray', 'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium',
        'staff', 'stage', 'stairs', 'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel',
        'steep', 'steer', 'stem', 'step', 'stereo', 'stick', 'still', 'sting', 'stock', 'stomach',
        'stone', 'stool', 'story', 'stove', 'strategy', 'street', 'strike', 'strong', 'struggle', 'student',
        'stuff', 'stumble', 'style', 'subject', 'submit', 'subway', 'success', 'such', 'sudden', 'suffer',
        'sugar', 'suggest', 'suit', 'sun', 'sunny', 'sunset', 'super', 'supply', 'support', 'suppose',
        'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain', 'swallow', 'swamp',
        'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim', 'swing', 'switch', 'sword', 'symbol',
        'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tank',
        'tape', 'target', 'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten',
        'tenant', 'tennis', 'tent', 'term', 'test', 'text', 'thank', 'that', 'theme', 'then',
        'theory', 'there', 'they', 'thing', 'this', 'thought', 'three', 'thrive', 'throw', 'thumb',
        'thunder', 'ticket', 'tide', 'tiger', 'tilt', 'timber', 'time', 'tiny', 'tip', 'tired',
        'tissue', 'title', 'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet', 'token',
        'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top', 'topic', 'topple',
        'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist', 'toward', 'tower', 'town', 'toy',
        'track', 'trade', 'traffic', 'tragic', 'train', 'transfer', 'trap', 'trash', 'travel', 'tray',
        'treat', 'tree', 'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy',
        'trouble', 'truck', 'true', 'truly', 'trumpet', 'trust', 'truth', 'try', 'tube', 'tuition',
        'tumble', 'tuna', 'tunnel', 'turkey', 'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twin',
        'twist', 'two', 'type', 'typical', 'ugly', 'umbrella', 'unable', 'unaware', 'uncle', 'uncover',
        'under', 'undo', 'unfair', 'unfold', 'unhappy', 'uniform', 'unique', 'unit', 'universe', 'unknown',
        'unlock', 'until', 'unusual', 'unveil', 'update', 'upgrade', 'uphold', 'upon', 'upper', 'upset',
        'urban', 'urge', 'usage', 'use', 'used', 'useful', 'useless', 'usual', 'utility', 'vacant',
        'vacuum', 'vague', 'valid', 'valley', 'valve', 'van', 'vanish', 'vapor', 'various', 'vast',
        'vault', 'vehicle', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version', 'very',
        'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view', 'village', 'vintage',
        'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice',
        'void', 'volcano', 'volume', 'vote', 'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall',
        'walnut', 'want', 'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave',
        'way', 'wealth', 'weapon', 'wear', 'weasel', 'weather', 'web', 'wedding', 'weekend', 'weird',
        'welcome', 'west', 'wet', 'whale', 'what', 'wheat', 'wheel', 'when', 'where', 'whip',
        'whisper', 'wide', 'width', 'wife', 'wild', 'will', 'win', 'window', 'wine', 'wing',
        'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf', 'woman',
        'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth', 'wrap', 'wreck',
        'wrestle', 'wrist', 'write', 'wrong', 'yard', 'year', 'yellow', 'you', 'young', 'youth',
        'zebra', 'zero', 'zone', 'zoo',
    ];

    /**
     * Encode an encryption key (base64-encoded) into a 24-word BIP39 mnemonic.
     *
     * Uses BIP39 standard: 256 bits of entropy + 8-bit checksum = 264 bits = 24 words.
     * This ensures the FULL 32-byte encryption key is recoverable.
     *
     * @param string $encryptionKey The base64-encoded encryption key.
     * @return array{mnemonic: string, words: array} The mnemonic phrase and individual words.
     */
    public function generateMnemonic(string $encryptionKey): array
    {
        // Decode the base64 key to raw bytes
        $keyBytes = base64_decode($encryptionKey, true);

        if ($keyBytes === false || strlen($keyBytes) !== 32) {
            throw new \InvalidArgumentException('Invalid encryption key: must be 32 bytes of base64-encoded data.');
        }

        // Convert full 32 bytes (256 bits) to binary string
        $bitString = '';
        for ($i = 0; $i < 32; $i++) {
            $bitString .= str_pad(decbin(ord($keyBytes[$i])), 8, '0', STR_PAD_LEFT);
        }

        // BIP39: 256 bits entropy → 8-bit checksum (first byte of SHA-256)
        // Total: 264 bits = 24 words × 11 bits
        $hash = hash('sha256', $keyBytes, true);
        $checksum = ord($hash[0]) >> 0; // Take all 8 bits for 256-bit entropy
        $bitString .= str_pad(decbin($checksum), 8, '0', STR_PAD_LEFT);

        // Split into 11-bit chunks and map to words
        $words = [];
        for ($i = 0; $i < 24; $i++) {
            $chunk = substr($bitString, $i * 11, 11);
            $index = bindec($chunk);
            $words[] = self::BIP39_WORDS[$index];
        }

        return [
            'mnemonic' => implode(' ', $words),
            'words' => $words,
        ];
    }

    /**
     * Decode a 24-word BIP39 mnemonic back to the original encryption key.
     *
     * Reverses generateMnemonic(): reconstructs the full 32 bytes from
     * 24 BIP39 words and verifies the 8-bit checksum.
     *
     * @param array $mnemonic Array of 24 BIP39 words.
     * @return string The base64-encoded encryption key.
     */
    public function recoverKey(array $mnemonic): string
    {
        if (count($mnemonic) !== 24) {
            throw new \InvalidArgumentException('Mnemonic must contain exactly 24 words.');
        }

        // Build a reverse lookup for BIP39 words
        $wordMap = array_flip(self::BIP39_WORDS);

        $bitString = '';
        foreach ($mnemonic as $word) {
            $normalized = strtolower(trim($word));
            if (!isset($wordMap[$normalized])) {
                throw new \InvalidArgumentException("Invalid BIP39 word: '{$word}'");
            }
            $index = $wordMap[$normalized];
            $bitString .= str_pad(decbin($index), 11, '0', STR_PAD_LEFT);
        }

        // Take first 256 bits (32 bytes) — the remaining 8 bits are checksum
        $keyBits = substr($bitString, 0, 256);
        $checksumBits = substr($bitString, 256, 8);

        // Reconstruct full 32-byte key
        $keyBytes = '';
        for ($i = 0; $i < 32; $i++) {
            $byte = substr($keyBits, $i * 8, 8);
            $keyBytes .= chr(bindec($byte));
        }

        // Verify checksum: first 8 bits of SHA-256 of the key
        $expectedChecksum = ord(hash('sha256', $keyBytes, true)[0]);
        $actualChecksum = bindec($checksumBits);

        if ($expectedChecksum !== $actualChecksum) {
            throw new \RuntimeException('Mnemonic checksum verification failed. The phrase may be incorrect.');
        }

        return base64_encode($keyBytes);
    }

    /**
     * Generate a downloadable PDF string containing the recovery mnemonic.
     *
     * Creates a basic PDF with user instructions and the mnemonic words
     * formatted for printing and secure storage.
     *
     * @param User  $user    The user for whom the kit is generated.
     * @param array $mnemonic The mnemonic words array.
     * @return string Raw PDF content as a string.
     */
    public function generateRecoveryPDF(User $user, array $mnemonic): string
    {
        $appName = config('app.name', 'Ecvaultz');
        $date = now()->format('Y-m-d H:i:s');
        $userName = $user->name;
        $userEmail = $user->email;

        // Format mnemonic words in numbered pairs for readability (24 words = 12 pairs)
        $wordsHtml = '';
        for ($i = 0; $i < 24; $i += 2) {
            $num1 = $i + 1;
            $num2 = $i + 2;
            $word1 = htmlspecialchars($mnemonic[$i] ?? '', ENT_QUOTES, 'UTF-8');
            $word2 = htmlspecialchars($mnemonic[$i + 1] ?? '', ENT_QUOTES, 'UTF-8');
            $wordsHtml .= "{$num1}. {$word1}    {$num2}. {$word2}\n";
        }

        $content = <<<TEXT
{$appName} - Encryption Key Recovery Kit
===========================================
Generated: {$date}
User: {$userName} ({$userEmail})

IMPORTANT: Store this document in a safe place. This is the ONLY
way to recover your encrypted files if you lose access to your account.

Your Recovery Mnemonic Phrase (12 words):
------------------------------------------
{$wordsHtml}

Instructions:
1. Write down these 12 words in order on paper.
2. Store the paper in a secure location (e.g., a safe).
3. Do NOT store this digitally (no screenshots, no cloud storage).
4. Do NOT share these words with anyone.
5. If you lose these words, your files cannot be recovered.

Security Notice:
- This mnemonic encodes your personal encryption key.
- Anyone with these words can decrypt your files.
- {appName} support staff will NEVER ask for these words.
- If you suspect these words have been compromised, rotate your keys immediately.

---
{$appName} - Secure Digital Vault
TEXT;

        // Create a simple PDF using basic PDF primitives
        // This avoids external dependencies while producing a valid, printable PDF
        $pdf = $this->createPdfFromText($content, $userName, $date);

        return $pdf;
    }

    /**
     * Create a minimal PDF document from text content.
     * Uses raw PDF specification to avoid external dependencies.
     */
    private function createPdfFromText(string $textContent, string $userName, string $date): string
    {
        $lines = explode("\n", $textContent);
        $escapedLines = [];
        foreach ($lines as $line) {
            $escapedLines[] = $this->escapePdfString($line);
        }

        // Build PDF objects
        $objects = [];

        // Object 1: Catalog
        $objects[1] = '1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj';

        // Object 2: Pages
        $objects[2] = '2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj';

        // Build content stream with text
        $stream = "BT\n";
        $stream .= "/F1 10 Tf\n";
        $y = 750;
        foreach ($escapedLines as $line) {
            $stream .= "50 {$y} Td ({$line}) Tj\n";
            $y -= 14;
            if ($y < 50) {
                $y = 750; // would need a new page in production
            }
        }
        $stream .= "ET\n";

        $streamLen = strlen($stream);

        // Object 3: Page
        $objects[3] = "3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>endobj";

        // Object 4: Content stream
        $objects[4] = "4 0 obj<</Length {$streamLen}>>stream\n{$stream}\nendstream\nendobj";

        // Object 5: Font
        $objects[5] = '5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Courier>>endobj';

        // Build file
        $body = implode("\n", $objects) . "\n";

        // Cross-reference table
        $offsets = [];
        $fileContent = '';
        $offset = 0;
        foreach ($objects as $num => $obj) {
            $offsets[$num] = $offset;
            $fileContent .= $obj . "\n";
            $offset = strlen($fileContent);
        }

        $xrefOffset = strlen($fileContent);
        $fileContent .= "xref\n";
        $fileContent .= "0 " . (count($objects) + 1) . "\n";
        $fileContent .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $fileContent .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $fileContent .= "trailer\n";
        $fileContent .= "<</Size " . (count($objects) + 1) . " /Root 1 0 R>>\n";
        $fileContent .= "startxref\n{$xrefOffset}\n%%EOF\n";

        return $fileContent;
    }

    /**
     * Escape special characters for PDF string literals.
     */
    private function escapePdfString(string $value): string
    {
        $value = str_replace('\\', '\\\\', $value);
        $value = str_replace('(', '\\(', $value);
        $value = str_replace(')', '\\)', $value);
        // Replace non-printable characters
        $value = preg_replace('/[^\x20-\x7E]/', ' ', $value);
        return $value;
    }
}
